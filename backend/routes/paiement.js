const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const SECRET = process.env.JWT_SECRET || 'tcf-canada-secret';

const PRIX = {
  mensuel: process.env.STRIPE_PRICE_MENSUEL,
  trimestriel: process.env.STRIPE_PRICE_TRIMESTRIEL,
  annuel: process.env.STRIPE_PRICE_ANNUEL
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

// Créer session Stripe Checkout
router.post('/creer-session', verifierToken, async (req, res) => {
  const { plan } = req.body;

  const { data: user } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', req.utilisateur.id)
    .single();

  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  try {
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.nom,
        metadata: { userId: String(user.id) }
      });
      customerId = customer.id;
      await supabase
        .from('utilisateurs')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRIX[plan], quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/paiement-succes?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/tarifs`,
      metadata: { userId: String(user.id), plan }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur Stripe', erreur: error.message });
  }
});

// Vérifier session ET activer Pro immédiatement
router.get('/verifier-session/:sessionId', verifierToken, async (req, res) => {
  try {
      console.log('=== VÉRIFICATION SESSION ===');
    console.log('Session ID:', req.params.sessionId);
    console.log('User ID:', req.utilisateur.id);
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
      { expand: ['subscription'] }
    );

    if (session.payment_status === 'paid') {
      const plan = session.metadata?.plan || 'mensuel';
      const durees = { mensuel: 30, trimestriel: 90, annuel: 365 };
      const jours = durees[plan] || 30;
      const dateFin = new Date();
      dateFin.setDate(dateFin.getDate() + jours);

      // Mettre à jour directement en base
      const { error } = await supabase
        .from('utilisateurs')
        .update({
          abonnement: 'pro',
          plan,
          date_abonnement: new Date().toISOString(),
          date_fin_abonnement: dateFin.toISOString()
        })
        .eq('id', req.utilisateur.id);

      if (error) {
        console.error('Erreur update Supabase:', error);
        return res.status(500).json({ message: 'Erreur mise à jour', erreur: error.message });
      }

      // Récupérer les données fraîches
      const { data: user } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('id', req.utilisateur.id)
        .single();

      // Générer nouveau token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        succes: true,
        token,
        utilisateur: {
          id: user.id,
          nom: user.nom,
          email: user.email,
          abonnement: 'pro',
          plan,
          dateFinAbonnement: dateFin.toISOString()
        }
      });
    } else {
      res.json({ succes: false, statut: session.payment_status });
    }
  } catch (error) {
    console.error('Erreur vérification session:', error);
    res.status(500).json({ message: 'Erreur vérification', erreur: error.message });
  }
});

// Webhook Stripe (production uniquement)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const { data: user } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (user) {
      await supabase
        .from('utilisateurs')
        .update({ abonnement: 'gratuit', plan: null })
        .eq('id', user.id);
    }
  }

  res.json({ received: true });
});

// Annuler abonnement
router.post('/annuler', verifierToken, async (req, res) => {
  const { data: user } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', req.utilisateur.id)
    .single();

  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

  try {
    if (user.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active'
      });
      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    }

    await supabase
      .from('utilisateurs')
      .update({ abonnement: 'gratuit', plan: null })
      .eq('id', user.id);

    res.json({ succes: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur annulation', erreur: error.message });
  }
});

module.exports = router;