const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SECRET = process.env.JWT_SECRET || 'tcf-canada-secret';

const explicationsSecours = {
  correct: "Bravo, c'est la bonne réponse ! Analysez bien les indices du texte pour comprendre pourquoi.",
  incorrect: "Ce n'est pas la bonne réponse. Relisez attentivement et cherchez les mots-clés."
};

function verifierToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Token manquant' });
  try {
    req.utilisateur = jwt.verify(auth.replace('Bearer ', ''), SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
}

async function verifierAccesPro(userId) {
  const { data } = await supabase
    .from('utilisateurs')
    .select('abonnement')
    .eq('id', userId)
    .single();
  return data?.abonnement === 'pro';
}

async function gemini(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

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
    const texte = await gemini(`Tu es un professeur de français expert en TCF.
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
  const { tache, sujet, redaction, niveau } = req.body;

  const estPro = await verifierAccesPro(req.utilisateur.id);
  if (!estPro) return res.status(403).json({ message: 'Fonctionnalité réservée aux membres Pro', accesRefuse: true });

  try {
    const texte = await gemini(`Tu es un correcteur expert du TCF pour l'expression écrite en français.
Tâche : ${tache}
Sujet : ${sujet}
Niveau cible : ${niveau}
Rédaction de l'étudiant :
"""
${redaction}
"""
Évalue cette rédaction et réponds UNIQUEMENT avec un objet JSON valide, sans balises markdown, sans texte avant ou après :
{"note":8,"note_max":20,"niveau_estime":"B2","points_forts":["point 1","point 2"],"points_ameliorer":["point 1","point 2"],"erreurs":[{"texte":"phrase erronée","correction":"phrase corrigée","type":"grammaire"}],"conseils":"conseil global en 2-3 phrases","version_corrigee":"version améliorée courte"}`);

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

  try {
    const texte = await gemini(`Tu es un correcteur expert du TCF pour l'expression orale en français.
Tâche : ${tache}
Sujet : ${sujet}
Niveau cible : ${niveau}
Durée enregistrée : ${dureeEnregistree}s / ${dureeAttandue}s attendues
Transcription de l'étudiant :
"""
${transcription}
"""
Évalue cette production orale et réponds UNIQUEMENT avec un objet JSON valide, sans balises markdown, sans texte avant ou après :
{"note":12,"note_max":20,"niveau_estime":"B2","criteres":[{"nom":"Cohérence et structure","note":3,"max":5,"commentaire":"..."},{"nom":"Richesse lexicale","note":3,"max":5,"commentaire":"..."},{"nom":"Correction grammaticale","note":3,"max":5,"commentaire":"..."},{"nom":"Fluidité et aisance","note":3,"max":5,"commentaire":"..."}],"points_forts":["point 1","point 2"],"points_ameliorer":["point 1","point 2"],"conseils":"conseil global en 2-3 phrases"}`);

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
    const texte = await gemini(`Tu es un expert en création de questions pour le TCF (Test de Connaissance du Français).
Génère exactement ${nombre} questions de ${sectionLabel} sur le thème : "${theme}"
Niveau : ${niveau}
Les sujets doivent porter sur le français en général (culture française, vie quotidienne, société francophone, actualités).
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après, sans balises markdown :
[{"texte":"texte du passage (2-4 phrases)","question":"la question posée","options":["option A","option B","option C","option D"],"correct":1,"explication":"explication courte"${estOral ? ',"audio_texte":"texte à lire à voix haute"' : ''}}]
Important : "correct" est l'index (0,1,2,3) de la bonne réponse. Varie les bonnes réponses.`);

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