const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const SECRET = process.env.JWT_SECRET || 'tcf-canada-secret';

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

router.post('/inscription', async (req, res) => {
  const { nom, email, motDePasse } = req.body;
  if (!nom || !email || !motDePasse)
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });

  const { data: existant } = await supabase
    .from('utilisateurs').select('id').eq('email', email).single();
  if (existant)
    return res.status(400).json({ message: 'Cet email est déjà utilisé' });

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const { data: nouvel, error } = await supabase
    .from('utilisateurs')
    .insert([{ nom, email, mot_de_passe: motDePasseHash }])
    .select().single();

  if (error)
    return res.status(500).json({ message: 'Erreur création compte', erreur: error.message });

  const token = jwt.sign({ id: nouvel.id, email }, SECRET, { expiresIn: '7d' });
  res.json({ token, utilisateur: { id: nouvel.id, nom, email, abonnement: 'gratuit' } });
});

router.post('/connexion', async (req, res) => {
  const { email, motDePasse } = req.body;
  const { data: utilisateur, error } = await supabase
    .from('utilisateurs').select('*').eq('email', email).single();

  if (error || !utilisateur)
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

  const valide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);
  if (!valide)
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

  const token = jwt.sign({ id: utilisateur.id, email }, SECRET, { expiresIn: '7d' });
  res.json({
    token,
    utilisateur: {
      id: utilisateur.id, nom: utilisateur.nom, email,
      abonnement: utilisateur.abonnement, plan: utilisateur.plan,
      dateFinAbonnement: utilisateur.date_fin_abonnement
    }
  });
});

router.put('/modifier-profil', verifierToken, async (req, res) => {
  const { nom } = req.body;
  if (!nom?.trim()) return res.status(400).json({ message: 'Nom invalide' });

  const { error } = await supabase
    .from('utilisateurs').update({ nom }).eq('id', req.utilisateur.id);
  if (error) return res.status(500).json({ message: 'Erreur modification' });

  res.json({ succes: true, nom });
});

router.put('/changer-mot-de-passe', verifierToken, async (req, res) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;
  if (!ancienMotDePasse || !nouveauMotDePasse)
    return res.status(400).json({ message: 'Champs manquants' });
  if (nouveauMotDePasse.length < 6)
    return res.status(400).json({ message: 'Mot de passe trop court' });

  const { data: user } = await supabase
    .from('utilisateurs').select('*').eq('id', req.utilisateur.id).single();

  const valide = await bcrypt.compare(ancienMotDePasse, user.mot_de_passe);
  if (!valide) return res.status(401).json({ message: 'Mot de passe actuel incorrect' });

  const hash = await bcrypt.hash(nouveauMotDePasse, 10);
  const { error } = await supabase
    .from('utilisateurs').update({ mot_de_passe: hash }).eq('id', req.utilisateur.id);
  if (error) return res.status(500).json({ message: 'Erreur changement mot de passe' });

  res.json({ succes: true });
});

module.exports = router;