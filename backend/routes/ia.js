const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const { verifierToken } = require('../middleware/auth');
const { estProActif, chargerUtilisateur } = require('../services/abonnement');

// Google retire régulièrement ses modèles (1.5, puis 2.5 pour les nouveaux comptes) et les plus récents
// sont parfois saturés (erreur 503). On essaie donc plusieurs modèles dans l'ordre, jusqu'à ce qu'un réponde.
// Pour changer la liste : GEMINI_MODELS=modele1,modele2,… (ou GEMINI_MODEL pour un seul modèle prioritaire).
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODELES_GEMINI = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || 'gemini-3.5-flash,gemini-flash-latest,gemini-flash-lite-latest')
  .split(',').map(m => m.trim()).filter(Boolean);
const DELAI_GEMINI_MS = 30000;
const modeles = MODELES_GEMINI.map(nom => ({ nom, modele: genAI.getGenerativeModel({ model: nom }, { timeout: DELAI_GEMINI_MS }) }));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const explicationsSecours = {
  correct: "Bravo, c'est la bonne réponse ! Analysez bien les indices du texte pour comprendre pourquoi.",
  incorrect: "Ce n'est pas la bonne réponse. Relisez attentivement et cherchez les mots-clés."
};

// Accès Pro = abonnement « pro » ET période payée non expirée (voir services/abonnement.js)
async function verifierAccesPro(userId) {
  return estProActif(await chargerUtilisateur(userId));
}

// Erreurs temporaires ou « modèle indisponible » : on passe au modèle suivant.
const erreurRecuperable = err => /\[(404|429|500|503|504)|timeout|aborted|fetch failed/i.test(String(err?.message || err));

async function gemini(prompt) {
  let derniereErreur;
  for (const { nom, modele } of modeles) {
    try {
      const result = await modele.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      derniereErreur = err;
      if (!erreurRecuperable(err)) throw err; // clé invalide, requête refusée… : inutile d'insister
      console.warn(`Gemini « ${nom} » indisponible, essai du modèle suivant :`, String(err.message).slice(0, 120));
    }
  }
  throw derniereErreur;
}

// Consignes de correction partagées par la version Pro et la démo publique
function promptRedaction({ tache, sujet, niveau, minMots, maxMots, nbMots, redaction }) {
  return `Tu es un correcteur certifié du TCF Canada pour l'épreuve d'expression écrite.
Rappel du format : tâche 1 = message (60 à 120 mots), tâche 2 = article ou récit (120 à 150 mots), tâche 3 = argumentation comparant deux documents (120 à 180 mots).
Évalue selon les critères du TCF Canada : adéquation à la consigne et au destinataire, cohérence et cohésion, étendue et maîtrise du lexique, correction grammaticale et orthographique.
Note sur 20, comme au TCF Canada (rappel : 10/20 ≈ NCLC 7, 12/20 ≈ NCLC 8, 14/20 ≈ NCLC 9, 16/20 et plus ≈ NCLC 10).
Pénalise un texte trop court ou hors sujet. Les canadianismes corrects (courriel, fin de semaine, magasiner…) ne sont PAS des erreurs.
Tâche : ${tache}
Sujet : ${sujet}
Niveau cible : ${niveau}
Longueur demandée : ${minMots || '?'} à ${maxMots || '?'} mots — longueur réelle : ${nbMots} mots
Rédaction de l'étudiant :
"""
${redaction}
"""
Évalue cette rédaction et réponds UNIQUEMENT avec un objet JSON valide, sans balises markdown, sans texte avant ou après :
{"note":8,"note_max":20,"niveau_estime":"B2","points_forts":["point 1","point 2"],"points_ameliorer":["point 1","point 2"],"erreurs":[{"texte":"phrase erronée","correction":"phrase corrigée","type":"grammaire"}],"conseils":"conseil global en 2-3 phrases","version_corrigee":"version améliorée courte"}`;
}

function promptOral({ tache, sujet, niveau, transcription, dureeEnregistree, dureeAttandue }) {
  return `Tu es un examinateur certifié du TCF Canada pour l'épreuve d'expression orale.
Rappel du format : tâche 1 = entretien dirigé (se présenter, 2 min), tâche 2 = exercice en interaction (poser des questions pour obtenir des informations, 3 min 30), tâche 3 = expression d'un point de vue argumenté (4 min 30).
Note sur 20, comme au TCF Canada (rappel : 10/20 ≈ NCLC 7, 12/20 ≈ NCLC 8, 14/20 ≈ NCLC 9, 16/20 et plus ≈ NCLC 10).
Il s'agit d'une transcription automatique : ignore la ponctuation et les petites erreurs de reconnaissance vocale. Les expressions québécoises ou acadiennes correctes ne sont PAS des erreurs.
Tâche : ${tache}
Sujet : ${sujet}
Niveau cible : ${niveau}
Durée enregistrée : ${dureeEnregistree}s / ${dureeAttandue}s attendues
Transcription de l'étudiant :
"""
${transcription}
"""
Évalue cette production orale et réponds UNIQUEMENT avec un objet JSON valide, sans balises markdown, sans texte avant ou après :
{"note":12,"note_max":20,"niveau_estime":"B2","criteres":[{"nom":"Cohérence et structure","note":3,"max":5,"commentaire":"..."},{"nom":"Richesse lexicale","note":3,"max":5,"commentaire":"..."},{"nom":"Correction grammaticale","note":3,"max":5,"commentaire":"..."},{"nom":"Fluidité et aisance","note":3,"max":5,"commentaire":"..."}],"points_forts":["point 1","point 2"],"points_ameliorer":["point 1","point 2"],"conseils":"conseil global en 2-3 phrases"}`;
}

function lireJSON(texte) {
  return JSON.parse(texte.replace(/```json|```/g, '').trim());
}

// ————— Démo publique : correction IA sans compte, protégée contre les abus —————
// Le sujet est imposé par le serveur (impossible d'envoyer ses propres consignes à l'IA).
const SUJETS_DEMO = {
  ecrit: {
    tache: 'Tâche 1 — Message', niveau: 'B1', minMots: 60, maxMots: 120,
    sujet: 'Vous venez d\'emménager dans un appartement à Montréal. Écrivez un message à vos nouveaux voisins pour vous présenter et les inviter à prendre un café chez vous samedi prochain.'
  },
  oral: {
    tache: 'Tâche 1 — Entretien dirigé', niveau: 'A2', duree: 60,
    sujet: 'Présentez-vous : votre nom, votre pays d\'origine, votre travail ou vos études, vos loisirs et pourquoi vous souhaitez vivre au Canada.'
  }
};
const DEMO_MAX_CARACTERES = 1500;
const DEMO_LIMITE_JOUR = parseInt(process.env.DEMO_LIMITE_JOUR || '200', 10); // plafond global, tous visiteurs confondus
const DEMO_FENETRE_MS = 24 * 60 * 60 * 1000;
const demoUtilisations = new Map(); // "ip|type" → date de la dernière correction réussie
const demoCompteur = { jour: '', total: 0 };
// Note : ces compteurs sont en mémoire. Ils repartent à zéro si le serveur redémarre,
// et ne sont pas partagés entre plusieurs instances. Suffisant pour limiter les abus et le coût.

function demoQuotaDisponible(cle) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  if (demoCompteur.jour !== aujourdhui) { demoCompteur.jour = aujourdhui; demoCompteur.total = 0; }
  if (demoCompteur.total >= DEMO_LIMITE_JOUR) return 'plafond';
  const derniere = demoUtilisations.get(cle);
  if (derniere && Date.now() - derniere < DEMO_FENETRE_MS) return 'deja';
  return null;
}

// Nettoyage périodique pour que la mémoire ne grossisse pas indéfiniment
setInterval(() => {
  const limite = Date.now() - DEMO_FENETRE_MS;
  for (const [cle, date] of demoUtilisations) if (date < limite) demoUtilisations.delete(cle);
}, 60 * 60 * 1000).unref();

router.post('/demo/corriger', async (req, res) => {
  const { type, texte, dureeEnregistree } = req.body || {};
  const sujet = SUJETS_DEMO[type];
  if (!sujet) return res.status(400).json({ message: 'Type de correction inconnu.' });

  const contenu = typeof texte === 'string' ? texte.trim() : '';
  const nbMots = contenu.split(/\s+/).filter(Boolean).length;
  const minimum = type === 'ecrit' ? 20 : 10;
  if (nbMots < minimum) return res.status(400).json({ message: `Votre réponse est trop courte (minimum ${minimum} mots).` });
  if (contenu.length > DEMO_MAX_CARACTERES) return res.status(400).json({ message: 'Votre réponse est trop longue pour la démo.' });

  const cle = `${req.ip}|${type}`;
  const blocage = demoQuotaDisponible(cle);
  if (blocage === 'deja') return res.status(429).json({ message: 'Vous avez déjà utilisé votre correction gratuite. Créez un compte pour continuer.', raison: 'deja' });
  if (blocage === 'plafond') return res.status(429).json({ message: 'La démo est très demandée aujourd\'hui. Créez un compte pour obtenir votre correction.', raison: 'plafond' });

  try {
    const prompt = type === 'ecrit'
      ? promptRedaction({ ...sujet, nbMots, redaction: contenu })
      : promptOral({ ...sujet, transcription: contenu, dureeEnregistree: Math.min(Number(dureeEnregistree) || 0, 600), dureeAttandue: sujet.duree });
    const correction = lireJSON(await gemini(prompt));
    // Le quota n'est consommé que si la correction a réussi
    demoUtilisations.set(cle, Date.now());
    demoCompteur.total += 1;
    res.json(correction);
  } catch (error) {
    console.error('Erreur correction démo:', error.message);
    res.status(503).json({ message: 'La correction automatique est momentanément indisponible. Réessayez plus tard.' });
  }
});

// Explication quiz
router.post('/expliquer', verifierToken, async (req, res) => {
  const { question, reponseUtilisateur, bonneReponse, optionChoisie, bonneOption } = req.body;

  const estPro = await verifierAccesPro(req.utilisateur.id);
  if (!estPro) {
    const aLaBonneReponse = reponseUtilisateur === bonneReponse;
    return res.json({
      explication: aLaBonneReponse ? explicationsSecours.correct : explicationsSecours.incorrect,
      limiteGratuit: true
    });
  }

  try {
    const texte = await gemini(`Tu es un professeur de français expert du TCF Canada, qui prépare des candidats à l'immigration au Canada.
Un étudiant vient de répondre à cette question :
Question : ${question}
Réponse choisie : ${optionChoisie}
Bonne réponse : ${bonneOption}
A-t-il bon ? ${reponseUtilisateur === bonneReponse ? 'Oui' : 'Non'}
Donne une explication pédagogique courte (3-4 phrases maximum) en français simple et clair.`);

    res.json({ explication: texte });
  } catch (error) {
    console.error('Erreur Gemini:', error);
    const aLaBonneReponse = reponseUtilisateur === bonneReponse;
    res.json({ explication: aLaBonneReponse ? explicationsSecours.correct : explicationsSecours.incorrect });
  }
});

// Correction expression écrite
router.post('/corriger-redaction', verifierToken, async (req, res) => {
  const { tache, sujet, redaction, niveau, minMots, maxMots } = req.body;
  const nbMots = (redaction || '').trim().split(/\s+/).filter(Boolean).length;

  const estPro = await verifierAccesPro(req.utilisateur.id);
  if (!estPro) return res.status(403).json({ message: 'Fonctionnalité réservée aux membres Pro', accesRefuse: true });
  // Pas d'appel d'IA (payant) pour un texte vide ou démesuré
  if (nbMots < 20) return res.status(400).json({ message: 'Votre texte est trop court pour être corrigé (minimum 20 mots).' });
  if ((redaction || '').length > 5000) return res.status(400).json({ message: 'Votre texte est trop long.' });

  try {
    const texte = await gemini(promptRedaction({ tache, sujet, niveau, minMots, maxMots, nbMots, redaction }));

    const propre = texte.replace(/```json|```/g, '').trim();
    const correction = JSON.parse(propre);

    await supabase.from('redactions').insert([{
      utilisateur_id: req.utilisateur.id,
      sujet,
      redaction,
      note: correction.note,
      note_max: correction.note_max,
      niveau_estime: correction.niveau_estime,
      correction
    }]);

    res.json(correction);
  } catch (error) {
    console.error('Erreur Gemini:', error);
    res.status(500).json({ message: 'Erreur correction', erreur: error.message });
  }
});

// Correction expression orale
router.post('/corriger-oral', verifierToken, async (req, res) => {
  const { tache, sujet, transcription, niveau, dureeEnregistree, dureeAttandue } = req.body;

  const estPro = await verifierAccesPro(req.utilisateur.id);
  if (!estPro) return res.status(403).json({ message: 'Fonctionnalité réservée aux membres Pro', accesRefuse: true });
  // Pas d'appel d'IA (payant) pour une transcription vide ou démesurée
  const motsOral = (transcription || '').trim().split(/\s+/).filter(Boolean).length;
  if (motsOral < 10) return res.status(400).json({ message: 'La transcription est trop courte pour être corrigée (minimum 10 mots).' });
  if ((transcription || '').length > 8000) return res.status(400).json({ message: 'La transcription est trop longue.' });

  try {
    const texte = await gemini(promptOral({ tache, sujet, niveau, transcription, dureeEnregistree, dureeAttandue }));

    const propre = texte.replace(/```json|```/g, '').trim();
    const correction = JSON.parse(propre);

    await supabase.from('productions_orales').insert([{
      utilisateur_id: req.utilisateur.id,
      sujet,
      transcription,
      note: correction.note,
      note_max: correction.note_max,
      niveau_estime: correction.niveau_estime,
      correction
    }]);

    res.json(correction);
  } catch (error) {
    console.error('Erreur Gemini:', error);
    res.status(500).json({ message: 'Erreur correction orale', erreur: error.message });
  }
});

// Génération de questions (Admin uniquement)
router.post('/generer-questions', verifierToken, async (req, res) => {
  const { theme, section, niveau, nombre } = req.body;

  const { data: userInfo } = await supabase
    .from('utilisateurs')
    .select('email')
    .eq('id', req.utilisateur.id)
    .single();

  if (userInfo?.email !== 'admin@tcfpro.com') {
    return res.status(403).json({ message: 'Accès réservé à l\'administrateur' });
  }

  const sectionLabel = {
    'comprehension-ecrite': 'compréhension écrite',
    'comprehension-orale': 'compréhension orale',
    'expression-ecrite': 'expression écrite',
    'expression-orale': 'expression orale'
  }[section] || 'compréhension écrite';

  const estOral = section === 'comprehension-orale';

  try {
    const consignesNiveau = {
      A1: 'documents très courts et très simples (affiche, horaire, texto), vocabulaire du quotidien, information explicite',
      A2: 'documents courts de la vie pratique (annonce, courriel simple, message vocal), information explicite',
      B1: 'textes ou messages de 3 à 5 phrases sur la vie courante, le travail, les services publics ; compréhension de l\'idée principale',
      B2: 'articles ou reportages de 4 à 6 phrases sur des sujets de société ; compréhension des opinions et des nuances',
      C1: 'textes argumentatifs ou entrevues denses ; inférences, intentions de l\'auteur, implicite',
      C2: 'textes abstraits et très nuancés, registre soutenu ; ironie, paradoxe, thèse implicite'
    }[niveau] || '';

    const texte = await gemini(`Tu es un concepteur d'épreuves du TCF Canada (Test de connaissance du français pour le Canada), utilisé par IRCC pour l'immigration.
Génère exactement ${nombre} questions de ${sectionLabel} de niveau ${niveau} sur le thème : "${theme}".
Niveau ${niveau} : ${consignesNiveau}.
Contexte OBLIGATOIRE : la vie au Canada (Québec, Acadie, Ontario français, Ouest canadien…) — logement, emploi, santé, école, services gouvernementaux, transport, climat, culture et société canadiennes. N'utilise PAS de contexte propre à la France.
Utilise un français standard compris partout, avec le vocabulaire canadien quand il est naturel (courriel, fin de semaine, dépanneur, 4 ½, chauffé-éclairé…).
Les trois mauvaises réponses doivent être plausibles et de même longueur que la bonne réponse. Aucune donnée inventée présentée comme un fait officiel précis (prix, lois, statistiques) : reste général ou fictif.
${estOral ? 'Pour la compréhension orale : "audio_texte" est le script parlé (dialogue avec tirets ou message), "texte" est un court titre de situation (ex. « Message vocal d\'un employeur »).' : '"texte" est le document à lire.'}
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après, sans balises markdown :
[{"texte":"...","question":"la question posée","options":["option A","option B","option C","option D"],"correct":1,"explication":"explication courte qui cite le passage"${estOral ? ',"audio_texte":"script à lire à voix haute"' : ''}}]
Important : "correct" est l'index (0,1,2,3) de la bonne réponse. Varie la position des bonnes réponses.`);

    const propre = texte.replace(/```json|```/g, '').trim();
    const nouvellesQuestions = JSON.parse(propre);

    const questionsFormatees = nouvellesQuestions.map(q => ({
      section,
      niveau,
      texte: q.texte,
      question: q.question,
      options: q.options,
      correct: q.correct,
      explication: q.explication,
      audio_texte: q.audio_texte || null
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsFormatees)
      .select();

    if (error) throw error;

    res.json({ succes: true, nombreGenere: data.length, questions: data });
  } catch (error) {
    console.error('Erreur Gemini:', error);
    res.status(500).json({ message: 'Erreur génération', erreur: error.message });
  }
});

module.exports = router;