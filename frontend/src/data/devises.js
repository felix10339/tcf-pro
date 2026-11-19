import { useEffect, useState } from 'react';
import API_URL from '../config';

// Pays → monnaie (priorité aux pays francophones et aux principaux pays d'origine des candidats)
const PAYS_DEVISE = {
  // Afrique centrale (franc CFA BEAC)
  CM: 'XAF', CG: 'XAF', GA: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
  // Afrique de l'Ouest (franc CFA BCEAO)
  SN: 'XOF', CI: 'XOF', ML: 'XOF', BF: 'XOF', NE: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF',
  CD: 'CDF', MA: 'MAD', DZ: 'DZD', TN: 'TND', GN: 'GNF', RW: 'RWF', BI: 'BIF', MG: 'MGA',
  MU: 'MUR', KM: 'KMF', DJ: 'DJF', MR: 'MRU', SC: 'SCR', HT: 'HTG', LB: 'LBP',
  NG: 'NGN', GH: 'GHS', KE: 'KES', EG: 'EGP',
  FR: 'EUR', BE: 'EUR', LU: 'EUR', MC: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR', IE: 'EUR', AT: 'EUR', GR: 'EUR',
  CH: 'CHF', GB: 'GBP', US: 'USD', MX: 'MXN', BR: 'BRL', CO: 'COP', IN: 'INR', CN: 'CNY', PH: 'PHP', VN: 'VND', IR: 'IRR'
};

// Libellés courants plutôt que les codes ISO
const SYMBOLES = {
  XAF: 'FCFA', XOF: 'FCFA', CDF: 'FC', MAD: 'DH', DZD: 'DA', TND: 'DT', GNF: 'FG', EUR: '€', USD: '$ US',
  CHF: 'CHF', GBP: '£', RWF: 'FRw', BIF: 'FBu', KMF: 'FC (KM)', DJF: 'FDJ', HTG: 'G', MGA: 'Ar', MUR: 'Rs'
};

// Monnaies proposées dans le menu de choix
export const DEVISES_PROPOSEES = [
  ['XAF', 'Franc CFA (Afrique centrale)'], ['XOF', 'Franc CFA (Afrique de l\'Ouest)'], ['CDF', 'Franc congolais'],
  ['MAD', 'Dirham marocain'], ['DZD', 'Dinar algérien'], ['TND', 'Dinar tunisien'], ['GNF', 'Franc guinéen'],
  ['RWF', 'Franc rwandais'], ['BIF', 'Franc burundais'], ['MGA', 'Ariary malgache'], ['HTG', 'Gourde haïtienne'],
  ['EUR', 'Euro'], ['CHF', 'Franc suisse'], ['USD', 'Dollar américain'], ['GBP', 'Livre sterling']
];

const CLE_STOCKAGE = 'devise-affichage';

// Arrondi lisible : on affiche une estimation, pas un montant exact
function arrondir(v) {
  if (v >= 10000) return Math.round(v / 100) * 100;
  if (v >= 1000) return Math.round(v / 50) * 50;
  if (v >= 100) return Math.round(v / 5) * 5;
  return Math.round(v * 100) / 100;
}

export function formaterMontant(valeur, devise) {
  const v = arrondir(valeur);
  const nombre = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: v >= 100 ? 0 : 2, minimumFractionDigits: v >= 100 ? 0 : 2 }).format(v);
  const symbole = SYMBOLES[devise] || devise;
  return symbole === '€' || symbole === '£' ? `${nombre} ${symbole}` : `${nombre} ${symbole}`;
}

// Pays déduit de la langue du navigateur (ex. « fr-CM » → CM), en secours
function paysDuNavigateur() {
  const langues = navigator.languages || [navigator.language];
  for (const l of langues) {
    const m = /-([A-Z]{2})$/i.exec(l || '');
    if (m) return m[1].toUpperCase();
  }
  return null;
}

async function detecterPays() {
  try {
    // Fonction Vercel (frontend/api/pays.js) : pays d'après l'adresse IP, rien n'est enregistré
    const r = await fetch('/api/pays', { cache: 'no-store' });
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
      const { pays } = await r.json();
      if (pays) return pays;
    }
  } catch { /* hors Vercel (développement) : on utilise la langue du navigateur */ }
  return paysDuNavigateur();
}

// Devise d'affichage du visiteur + taux de change (base CAD)
export function useDeviseLocale() {
  const [devise, setDeviseEtat] = useState(null);
  const [taux, setTaux] = useState(null);
  const [miseAJour, setMiseAJour] = useState(null);

  useEffect(() => {
    let actif = true;
    (async () => {
      let choix = null;
      try { choix = localStorage.getItem(CLE_STOCKAGE); } catch { /* stockage indisponible */ }
      if (choix === null) {
        const pays = await detecterPays();
        choix = PAYS_DEVISE[pays] || '';
      }
      if (actif) setDeviseEtat(choix);
    })();
    fetch(`${API_URL}/api/devises`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (actif && d?.taux) { setTaux(d.taux); setMiseAJour(d.miseAJour); } })
      .catch(() => { /* sans taux, on affiche seulement le prix en CAD */ });
    return () => { actif = false; };
  }, []);

  const setDevise = d => {
    setDeviseEtat(d);
    try { localStorage.setItem(CLE_STOCKAGE, d); } catch { /* stockage indisponible */ }
  };

  // Renvoie « 2 900 FCFA » pour un montant en CAD, ou null si rien à afficher
  const convertir = montantCAD => {
    if (!devise || devise === 'CAD' || !taux?.[devise]) return null;
    return formaterMontant(montantCAD * taux[devise], devise);
  };

  return { devise, setDevise, convertir, disponible: !!taux, miseAJour };
}
