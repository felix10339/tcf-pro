const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const { SECRET, verifierToken } = require('../middleware/auth');
const { appliquerAbonnement, estProActif, chargerUtilisateur, versPublic, finDePeriode, supabase } = require('../services/abonnement');

const PRIX = {
  mensuel: process.env.STRIPE_PRICE_MENSUEL,
  trimestriel: process.env.STRIPE_PRICE_TRIMESTRIEL,
  annuel: process.env.STRIPE_PRICE_ANNUEL
};

const idDe = objet => (typeof objet === 'string' ? objet : objet?.id);

// ————— 1. Créer la page de paiement Stripe —————
router.post('/creer-session', verifierToken, async (req, res) => {
  const { plan } = req.body;
  if (!PRIX[plan]) return res.status(400).json({ message: 'Forfait inconnu.' });

  const user = await chargerUtilisateur(req.utilisateur.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  if (estProActif(user)) return res.status(409).json({ message: 'Vous êtes déjà abonné Pro. Gérez votre abonnement depuis votre profil.' });

  try {
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.nom,
        metadata: { userId: String(user.id) }
      });
      customerId = customer.id;
      await supabase.from('utilisateurs').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PRIX[plan], quantity: 1 }],
      client_reference_id: String(user.id),
      metadata: { userId: String(user.id), plan },
      // Les métadonnées sont recopiées sur l'abonnement : le webhook retrouve ainsi l'utilisateur à chaque renouvellement.
      subscription_data: { metadata: { userId: String(user.id), plan } },
      allow_promotion_codes: true,
      locale: 'fr-CA',
      success_url: `${process.env.FRONTEND_URL}/paiement-succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/?paiement=annule`
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Erreur création session Stripe :', error.message);
    res.status(500).json({ message: 'Impossible de créer la session de paiement.' });
  }
});

// ————— 2. Retour sur le site après paiement : activation immédiate —————
// Le webhook fait aussi l'activation ; cette route permet d'afficher le Pro sans attendre.
router.get('/verifier-session/:sessionId', verifierToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, { expand: ['subscription'] });

    const proprietaire = session.metadata?.userId || session.client_reference_id;
    if (proprietaire !== String(req.utilisateur.id)) {
      return res.status(403).json({ message: 'Cette session de paiement ne vous appartient pas' });
    }

    if (session.status !== 'complete' || !session.subscription) {
      return res.json({ succes: false, statut: session.payment_status });
    }

    const subscription = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;
    const user = await appliquerAbonnement(subscription);
    if (!user) return res.status(500).json({ message: 'Utilisateur introuvable pour cet abonnement.' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ succes: estProActif(user), token, utilisateur: versPublic(user) });
  } catch (error) {
    console.error('Erreur vérification session :', error.message);
    res.status(500).json({ message: 'Erreur de vérification du paiement.' });
  }
});

// ————— 3. Webhook Stripe : la source de vérité —————
// Activation, renouvellements, échecs de paiement, annulations : tout passe par ici,
// même si le client ferme son navigateur.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET manquant : webhook refusé');
    return res.status(500).send('Webhook non configuré');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Signature invalide : ${err.message}`);
  }

  try {
    const objet = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
        if (objet.mode === 'subscription' && objet.subscription) {
          await appliquerAbonnement(await stripe.subscriptions.retrieve(idDe(objet.subscription)));
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await appliquerAbonnement(objet);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        // Selon la version de l'API, l'abonnement est à la racine ou dans « parent ».
        const subId = idDe(objet.subscription) || idDe(objet.parent?.subscription_details?.subscription);
        if (subId) await appliquerAbonnement(await stripe.subscriptions.retrieve(subId));
        break;
      }

      default:
        break; // événement non utilisé
    }
    res.json({ received: true });
  } catch (error) {
    // Erreur 500 : Stripe renverra l'événement plus tard
    console.error(`Erreur traitement webhook ${event.type} :`, error.message);
    res.status(500).send('Erreur de traitement');
  }
});

// ————— 4. Portail client Stripe : carte, factures, changement de forfait, annulation —————
router.post('/portail', verifierToken, async (req, res) => {
  const user = await chargerUtilisateur(req.utilisateur.id);
  if (!user?.stripe_customer_id) return res.status(400).json({ message: 'Aucun abonnement à gérer.' });
  try {
    const portail = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/?retour=portail`,
      locale: 'fr-CA'
    });
    res.json({ url: portail.url });
  } catch (error) {
    console.error('Erreur portail Stripe :', error.message);
    res.status(500).json({ message: 'Impossible d\'ouvrir la gestion de l\'abonnement.' });
  }
});

// ————— 5. Annulation : l'accès Pro reste actif jusqu'à la fin de la période payée —————
router.post('/annuler', verifierToken, async (req, res) => {
  const user = await chargerUtilisateur(req.utilisateur.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  if (!user.stripe_customer_id) return res.status(400).json({ message: 'Aucun abonnement actif.' });

  try {
    const abonnements = await stripe.subscriptions.list({ customer: user.stripe_customer_id, status: 'active' });
    let dateFin = null;
    for (const sub of abonnements.data) {
      const maj = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
      await appliquerAbonnement(maj);
      dateFin = finDePeriode(maj);
    }
    res.json({ succes: true, dateFin: dateFin ? dateFin.toISOString() : null });
  } catch (error) {
    console.error('Erreur annulation :', error.message);
    res.status(500).json({ message: 'Erreur lors de l\'annulation.' });
  }
});

module.exports = router;
