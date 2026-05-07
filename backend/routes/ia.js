const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

// Explication quiz
router.post('/expliquer', verifierToken, async (req, res) => {
  const { question, reponseUtilisateur, bonneReponse, optionChoisie, bonneOption } = req.body;

  const estPro = await verifierAccesPro(req.utilisateur.id);
  if (!estPro) {
    const aLaBonneReponse = reponseUtilisateur === bonneReponse;
    return res.json({ explication: aLaBonneReponse ? explicationsSecours.correct : explicationsSecours.incorrect, limiteGratuit: true });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Tu es un professeur de français expert en TCF.
Un étudiant vient de répondre :
Question : ${question}
Réponse choisie : ${optionChoisie}
Bonne réponse : ${bonneOption}
A-t-il bon ? ${reponseUtilisateur === bonneReponse ? 'Oui' : 'Non'}
Donne une explication pédagogique (3-4 phrases) en français simple.` }]
    });
    res.json({ explication: message.content[0].text });
  } catch (error) {
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
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: `Tu es un correcteur expert du TCF pour l'expression écrite en français.
Tâche : ${tache}
Sujet : ${sujet}
Niveau cible : ${niveau}
Rédaction :
"""
${redaction}
"""
Réponds UNIQUEMENT avec un JSON valide sans balises markdown :
{"note":8,"note_max":20,"niveau_estime":"B2","points_forts":["..."],"points_ameliorer":["..."],"erreurs":[{"texte":"...","correction":"...","type":"grammaire"}],"conseils":"...","version_corrigee":"..."}` }]
    });
    let texte = message.content[0].text.trim().replace(/```json|```/g, '').trim();
    const correction = JSON.parse(texte);

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
    console.error(error);
    res.status(500).json({ message: 'Erreur correction', erreur: error.message });
  }
});

// Correction expression orale
router.post('/corriger-oral', verifierToken, async (req, res) => {
  const { tache, sujet, transcription, niveau, dureeEnregistree, dureeAttandue } = req.body;

  const estPro = await verifierAccesPro(req.utilisateur.id);
  if (!estPro) return res.status(403).json({ message: 'Fonctionnalité réservée aux membres Pro', accesRefuse: true });

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{ role: 'user', content: `Tu es un correcteur expert du TCF pour l'expression orale en français.
Tâche : ${tache}
Sujet : ${sujet}
Niveau cible : ${niveau}
Durée enregistrée : ${dureeEnregistree}s / ${dureeAttandue}s attendues
Transcription :
"""
${transcription}
"""
Réponds UNIQUEMENT avec un JSON valide sans balises markdown :
{"note":12,"note_max":20,"niveau_estime":"B2","criteres":[{"nom":"Cohérence et structure","note":3,"max":5,"commentaire":"..."},{"nom":"Richesse lexicale","note":3,"max":5,"commentaire":"..."},{"nom":"Correction grammaticale","note":3,"max":5,"commentaire":"..."},{"nom":"Fluidité et aisance","note":3,"max":5,"commentaire":"..."}],"points_forts":["..."],"points_ameliorer":["..."],"conseils":"..."}` }]
    });
    let texte = message.content[0].text.trim().replace(/```json|```/g, '').trim();
    const correction = JSON.parse(texte);

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
    console.error(error);
    res.status(500).json({ message: 'Erreur correction orale', erreur: error.message });
  }
});

// Génération de questions (Pro uniquement)
router.post('/generer-questions', verifierToken, async (req, res) => {
  const { theme, section, niveau, nombre } = req.body;

  const estPro = await verifierAccesPro(req.utilisateur.id);
  if (!estPro) return res.status(403).json({ message: 'Fonctionnalité réservée aux membres Pro', accesRefuse: true });

  const sectionLabel = {
    'comprehension-ecrite': 'compréhension écrite',
    'comprehension-orale': 'compréhension orale'
  }[section] || 'compréhension écrite';
  const estOral = section === 'comprehension-orale';

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: `Tu es un expert en création de questions pour le TCF (Test de Connaissance du Français).
Génère exactement ${nombre} questions de ${sectionLabel} sur le thème : "${theme}"
Niveau : ${niveau}
Les sujets doivent porter sur le français en général (culture française, vie quotidienne, grammaire, littérature, actualités francophones).
Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après :
[{"texte":"...","question":"...","options":["A","B","C","D"],"correct":1,"explication":"..."${estOral ? ',"audio_texte":"..."' : ''}}]` }]
    });

    let texte = message.content[0].text.trim().replace(/```json|```/g, '').trim();
    const nouvellesQuestions = JSON.parse(texte);

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
    res.status(500).json({ message: 'Erreur génération', erreur: error.message });
  }
});

module.exports = router;