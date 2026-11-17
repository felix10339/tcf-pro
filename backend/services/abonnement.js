// Source de vérité des abonnements : Stripe.
// Ce module recopie l'état d'un abonnement Stripe dans la table « utilisateurs »
// et décide si un utilisateur a accès aux fonctions Pro.
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Statuts Stripe qui donnent accès au Pro.
// « past_due » : un renouvellement a échoué et Stripe réessaie ; on laisse l'accès pendant les relances.
const STATUTS_ACTIFS = ['active', 'trialing', 'past_due'];
// Marge après la date de fin, le temps que Stripe confirme le renouvellement.
const GRACE_MS = 2 * 24 * 60 * 60 * 1000;

// Avec les versions récentes de l'API Stripe, la fin de période est portée par les éléments de l'abonnement.
function finDePeriode(subscription) {
  const fin = subscription.items?.data?.[0]?.current_period_end ?? subscription.current_period_end;
  return fin ? new Date(fin * 1000) : null;
}

function planDepuisAbonnement(subscription) {
  if (subscription.metadata?.plan) return subscription.metadata.plan;
  const prix = subscription.items?.data?.[0]?.price?.id;
  const correspondance = {
    [process.env.STRIPE_PRICE_MENSUEL]: 'mensuel',
    [process.env.STRIPE_PRICE_TRIMESTRIEL]: 'trimestriel',
    [process.env.STRIPE_PRICE_ANNUEL]: 'annuel'
  };
  return correspondance[prix] || null;
}

// Retrouve l'utilisateur lié à un abonnement (par l'identifiant mis dans les métadonnées, sinon par le client Stripe).
async function trouverUtilisateur(subscription) {
  const userId = subscription.metadata?.userId;
  if (userId) {
    const { data } = await supabase.from('utilisateurs').select('*').eq('id', userId).maybeSingle();
    if (data) return data;
  }
  const clientId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  if (!clientId) return null;
  const { data } = await supabase.from('utilisateurs').select('*').eq('stripe_customer_id', clientId).maybeSingle();
  return data || null;
}

// Recopie l'état d'un abonnement Stripe dans la base. Idempotent : peut être appelé plusieurs fois sans risque.
async function appliquerAbonnement(subscription) {
  const utilisateur = await trouverUtilisateur(subscription);
  if (!utilisateur) {
    console.warn('Abonnement Stripe sans utilisateur correspondant :', subscription.id);
    return null;
  }

  const actif = STATUTS_ACTIFS.includes(subscription.status);
  const dateFin = finDePeriode(subscription);
  const clientId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  const miseAJour = actif
    ? {
        abonnement: 'pro',
        plan: planDepuisAbonnement(subscription) || utilisateur.plan || 'mensuel',
        date_abonnement: subscription.start_date ? new Date(subscription.start_date * 1000).toISOString() : utilisateur.date_abonnement,
        date_fin_abonnement: dateFin ? dateFin.toISOString() : null,
        stripe_customer_id: clientId || utilisateur.stripe_customer_id
      }
    : {
        abonnement: 'gratuit',
        plan: null,
        date_fin_abonnement: dateFin ? dateFin.toISOString() : utilisateur.date_fin_abonnement,
        stripe_customer_id: clientId || utilisateur.stripe_customer_id
      };

  const { data, error } = await supabase.from('utilisateurs').update(miseAJour).eq('id', utilisateur.id).select('*').single();
  if (error) throw error;
  return data;
}

// L'utilisateur a-t-il accès au Pro en ce moment ?
function estProActif(utilisateur) {
  if (!utilisateur || utilisateur.abonnement !== 'pro') return false;
  if (!utilisateur.date_fin_abonnement) return true; // anciens comptes sans date : on fait confiance au statut
  return new Date(utilisateur.date_fin_abonnement).getTime() + GRACE_MS > Date.now();
}

// Lit l'utilisateur en base et rétrograde automatiquement un abonnement expiré.
async function chargerUtilisateur(id) {
  const { data: utilisateur } = await supabase.from('utilisateurs').select('*').eq('id', id).maybeSingle();
  if (!utilisateur) return null;
  if (utilisateur.abonnement === 'pro' && !estProActif(utilisateur)) {
    const { data } = await supabase.from('utilisateurs').update({ abonnement: 'gratuit', plan: null }).eq('id', id).select('*').single();
    return data;
  }
  return utilisateur;
}

// Ce que le navigateur a le droit de voir (jamais le mot de passe chiffré).
function versPublic(u) {
  return {
    id: u.id,
    nom: u.nom,
    email: u.email,
    abonnement: estProActif(u) ? 'pro' : 'gratuit',
    plan: u.plan || null,
    dateFinAbonnement: u.date_fin_abonnement || null
  };
}

module.exports = { appliquerAbonnement, estProActif, chargerUtilisateur, versPublic, finDePeriode, supabase };
