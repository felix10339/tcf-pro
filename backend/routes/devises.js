// Taux de change pour afficher l'équivalent des prix (en CAD) dans la monnaie du visiteur.
// Source : ExchangeRate-API (accès ouvert, attribution requise), consultée au plus toutes les 12 h.
// Aucune donnée de visiteur n'est transmise à ce service.
const express = require('express');
const router = express.Router();

const SOURCE = 'https://open.er-api.com/v6/latest/CAD';
const DUREE_CACHE_MS = 12 * 60 * 60 * 1000;
let cache = null; // { recupere: Date.now(), donnees }

async function chargerTaux() {
  if (cache && Date.now() - cache.recupere < DUREE_CACHE_MS) return cache.donnees;
  const reponse = await fetch(SOURCE, { signal: AbortSignal.timeout(10000) });
  const json = await reponse.json();
  if (json.result !== 'success' || !json.rates) throw new Error('Réponse inattendue du service de taux');
  const donnees = { base: 'CAD', miseAJour: json.time_last_update_utc, taux: json.rates };
  cache = { recupere: Date.now(), donnees };
  return donnees;
}

router.get('/', async (req, res) => {
  try {
    const donnees = await chargerTaux();
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(donnees);
  } catch (err) {
    console.error('Taux de change indisponibles :', err.message);
    // En cas de panne, on renvoie les derniers taux connus s'il y en a
    if (cache) return res.json(cache.donnees);
    res.status(503).json({ message: 'Taux de change momentanément indisponibles.' });
  }
});

module.exports = router;
