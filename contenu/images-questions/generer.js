// Génère les documents visuels des questions (affiches, panneaux, horaires, reçus…) en PNG.
// Ces images sont créées pour TCF Pro : aucun problème de droits d'auteur.
// Usage : node contenu/images-questions/generer.js   (depuis la racine du projet)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SORTIE = path.join(__dirname, '..', '..', 'frontend', 'public', 'questions');
const TEMP = path.join(__dirname, '.rendu');
fs.mkdirSync(SORTIE, { recursive: true });
fs.mkdirSync(TEMP, { recursive: true });

const BASE = `
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter', sans-serif; color:#1a1a1a; display:flex; align-items:center; justify-content:center; }
</style>`;

const DOCUMENTS = [
  {
    nom: 'panneau-stationnement', l: 800, h: 800, fond: '#E9EEF2',
    html: `
    <div style="width:520px;background:#fff;border:10px solid #1a1a1a;border-radius:24px;padding:36px 30px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.18)">
      <svg width="220" height="220" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#fff" stroke="#C8102E" stroke-width="9"/><text x="50" y="66" text-anchor="middle" font-family="Inter" font-weight="900" font-size="48" fill="#1a1a1a">P</text><line x1="20" y1="20" x2="80" y2="80" stroke="#C8102E" stroke-width="9"/></svg>
      <div style="font-size:44px;font-weight:900;letter-spacing:1px;margin-top:18px">LUN – VEN</div>
      <div style="font-size:60px;font-weight:900;margin:6px 0 14px">8 h – 18 h</div>
      <div style="border-top:4px solid #1a1a1a;padding-top:14px;font-size:26px;font-weight:700">Remorquage à vos frais</div>
    </div>`
  },
  {
    nom: 'horaire-autobus', l: 900, h: 700, fond: '#DDE3E8',
    html: `
    <div style="width:760px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.18)">
      <div style="background:#00843D;color:#fff;padding:22px 30px;display:flex;align-items:center;gap:20px">
        <div style="background:#fff;color:#00843D;font-weight:900;font-size:44px;width:84px;height:84px;border-radius:14px;display:flex;align-items:center;justify-content:center">24</div>
        <div><div style="font-size:30px;font-weight:800">Direction Centre-ville</div><div style="font-size:20px;opacity:.9">Arrêt : Station Laurier</div></div>
      </div>
      <div style="padding:22px 30px">
        <div style="font-size:20px;font-weight:800;color:#555;margin-bottom:12px">LUNDI AU VENDREDI · Départs</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;font-size:26px;font-weight:700;font-variant-numeric:tabular-nums">
          <span>6 h 05</span><span>6 h 35</span><span>7 h 05</span><span>7 h 35</span>
          <span>8 h 05</span><span>… toutes</span><span>les 30 min …</span><span>21 h 15</span>
          <span>21 h 45</span><span>22 h 15</span><span>22 h 45</span><span style="color:#C8102E">23 h 15</span>
        </div>
        <div style="margin-top:18px;padding:14px 16px;background:#F2F5F7;border-radius:10px;font-size:20px">
          <b>Samedi et dimanche :</b> départs toutes les 60 minutes, de 7 h à 22 h.
        </div>
      </div>
    </div>`
  },
  {
    nom: 'affiche-soldes', l: 800, h: 1000, fond: '#EFEAE4',
    html: `
    <div style="width:600px;height:840px;background:#C8102E;color:#fff;border-radius:18px;padding:50px 46px;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,.2)">
      <div style="font-size:30px;font-weight:800;letter-spacing:3px">BOUTIQUE NORDIK</div>
      <div style="font-size:74px;font-weight:900;line-height:1;margin-top:40px">GRANDE<br>VENTE<br>D'HIVER</div>
      <div style="margin-top:36px;background:#fff;color:#C8102E;border-radius:14px;padding:22px;text-align:center">
        <div style="font-size:96px;font-weight:900;line-height:1">−30 %</div>
        <div style="font-size:30px;font-weight:800;color:#1a1a1a;margin-top:6px">sur les manteaux et les bottes</div>
      </div>
      <div style="margin-top:auto;font-size:28px;font-weight:700">Du 26 décembre au 15 janvier</div>
      <div style="font-size:22px;opacity:.9;margin-top:6px">Centre commercial des Rivières · 2e étage</div>
    </div>`
  },
  {
    nom: 'recu-epicerie', l: 700, h: 1000, fond: '#E4E6E8',
    html: `
    <div style="width:470px;background:#fff;padding:36px 34px;font-family:'Roboto Mono', monospace;font-size:21px;line-height:1.6;box-shadow:0 20px 50px rgba(0,0,0,.18)">
      <div style="text-align:center;font-weight:600;font-size:26px">MARCHÉ DU QUARTIER</div>
      <div style="text-align:center;font-size:17px;color:#555">1250, rue Principale, Québec<br>12/03 · 17:42 · Caisse 4</div>
      <div style="border-top:2px dashed #999;margin:16px 0"></div>
      <div style="display:flex;justify-content:space-between"><span>Lait 2 L</span><span>5,49</span></div>
      <div style="display:flex;justify-content:space-between"><span>Pain tranché</span><span>3,99</span></div>
      <div style="display:flex;justify-content:space-between"><span>Pommes 1,2 kg</span><span>4,79</span></div>
      <div style="display:flex;justify-content:space-between"><span>Fromage cheddar</span><span>6,49</span></div>
      <div style="display:flex;justify-content:space-between"><span>Savon vaisselle *</span><span>2,69</span></div>
      <div style="border-top:2px dashed #999;margin:16px 0"></div>
      <div style="display:flex;justify-content:space-between"><span>SOUS-TOTAL</span><span>23,45</span></div>
      <div style="display:flex;justify-content:space-between"><span>TPS 5 %</span><span>0,13</span></div>
      <div style="display:flex;justify-content:space-between"><span>TVQ 9,975 %</span><span>0,27</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:600;font-size:26px;margin-top:8px"><span>TOTAL</span><span>23,85 $</span></div>
      <div style="display:flex;justify-content:space-between;margin-top:8px"><span>Carte de débit</span><span>23,85</span></div>
      <div style="border-top:2px dashed #999;margin:16px 0"></div>
      <div style="text-align:center;font-size:17px;color:#555">* article taxable<br>Merci et à bientôt !</div>
    </div>`
  },
  {
    nom: 'babillard-patin', l: 850, h: 900, fond: '#C9A27A',
    html: `
    <div style="width:620px;background:#FFFBEA;padding:46px 44px;transform:rotate(-1.5deg);box-shadow:0 16px 40px rgba(0,0,0,.3);position:relative">
      <div style="position:absolute;top:-14px;left:50%;width:30px;height:30px;border-radius:50%;background:#C8102E;box-shadow:0 3px 6px rgba(0,0,0,.4)"></div>
      <div style="font-size:24px;font-weight:800;color:#0B5394;letter-spacing:2px">NOUVEAUX ARRIVANTS</div>
      <div style="font-size:58px;font-weight:900;line-height:1.05;margin:14px 0 22px">Cours de patin<br>GRATUITS</div>
      <div style="font-size:26px;line-height:1.6">
        📍 Aréna Marcel-Dutil<br>
        🗓️ Les samedis, de 10 h à 11 h<br>
        ⛸️ Patins et casques prêtés sur place
      </div>
      <div style="margin-top:24px;background:#C8102E;color:#fff;padding:16px 18px;border-radius:10px;font-size:25px;font-weight:800">
        Inscription obligatoire : 819-555-0193
      </div>
      <div style="margin-top:12px;font-size:21px;color:#555">Places limitées · Pour adultes et enfants de 6 ans et plus</div>
    </div>`
  },
  {
    nom: 'avis-collecte', l: 900, h: 760, fond: '#E2E8EC',
    html: `
    <div style="width:740px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.16)">
      <div style="background:#1F3A5F;color:#fff;padding:22px 32px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:30px;font-weight:800">Ville de Laval</div>
        <div style="font-size:20px;font-weight:700;letter-spacing:2px">AVIS AUX CITOYENS</div>
      </div>
      <div style="padding:32px;font-size:25px;line-height:1.6">
        <div style="font-size:34px;font-weight:800;margin-bottom:14px">Collectes du temps des Fêtes</div>
        En raison du jour de l'An, <b>la collecte des ordures du mercredi 1er janvier aura lieu le jeudi 2 janvier.</b>
        <div style="margin-top:16px">La collecte du recyclage n'est pas modifiée.</div>
        <div style="margin-top:22px;padding:14px 18px;background:#F1F4F7;border-left:6px solid #1F3A5F;font-size:21px">Déposez vos bacs en bordure de rue la veille, après 19 h.</div>
      </div>
    </div>`
  },
  {
    nom: 'carte-rendez-vous', l: 900, h: 600, fond: '#DCE5EA',
    html: `
    <div style="width:720px;background:#fff;border-radius:18px;padding:34px 38px;box-shadow:0 20px 50px rgba(0,0,0,.16);border-top:12px solid #0E7C86">
      <div style="font-size:28px;font-weight:800;color:#0E7C86">Clinique médicale Saint-Roch</div>
      <div style="font-size:19px;color:#666;margin-bottom:22px">Carte de rendez-vous</div>
      <div style="display:grid;grid-template-columns:170px 1fr;gap:10px 18px;font-size:25px">
        <span style="color:#666">Médecin</span><b>Dre Gagnon</b>
        <span style="color:#666">Date</span><b>Mardi 14 février</b>
        <span style="color:#666">Heure</span><b>9 h 30</b>
      </div>
      <div style="margin-top:22px;padding:14px 18px;background:#E7F5F6;border-radius:10px;font-size:21px;line-height:1.5">
        <b>Apportez votre carte d'assurance maladie.</b><br>Pour annuler, appelez-nous au moins 24 heures à l'avance.
      </div>
    </div>`
  },
  {
    nom: 'annonce-velo', l: 820, h: 900, fond: '#F0F2F5',
    html: `
    <div style="width:600px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 14px 40px rgba(0,0,0,.14)">
      <div style="height:260px;background:linear-gradient(135deg,#dfe7ee,#c7d3dd);display:flex;align-items:center;justify-content:center">
        <svg width="300" height="180" viewBox="0 0 150 90" fill="none" stroke="#2b3a48" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="60" r="24"/><circle cx="118" cy="60" r="24"/><path d="M32 60 58 22h40l20 38M58 22 76 60h42M88 12h14"/></svg>
      </div>
      <div style="padding:26px 28px">
        <div style="font-size:42px;font-weight:900">150 $</div>
        <div style="font-size:28px;font-weight:700;margin-top:4px">Vélo à pneus surdimensionnés (fatbike)</div>
        <div style="font-size:19px;color:#65676B;margin-top:4px">Sherbrooke · publié il y a 2 jours</div>
        <div style="border-top:1px solid #e4e6eb;margin:18px 0"></div>
        <div style="font-size:22px;line-height:1.6">Utilisé un seul hiver, très bon état. Idéal pour rouler dans la neige.<br><b>Ramassage à Sherbrooke seulement, pas de livraison.</b></div>
      </div>
    </div>`
  },
  {
    nom: 'meteo-hiver', l: 900, h: 620, fond: '#CFDDEA',
    html: `
    <div style="width:740px;background:linear-gradient(160deg,#3B5F86,#203A55);color:#fff;border-radius:22px;padding:34px 38px;box-shadow:0 20px 50px rgba(0,0,0,.25)">
      <div style="font-size:26px;font-weight:700;opacity:.9">Québec · Aujourd'hui</div>
      <div style="display:flex;align-items:center;gap:28px;margin-top:10px">
        <svg width="150" height="150" viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M20 38a12 12 0 1 1 3-23.6A14 14 0 0 1 50 20a10 10 0 0 1-2 18z" fill="rgba(255,255,255,.15)"/><path d="M24 46v8M20 50h8M38 46v8M34 50h8M31 56v6M27 59h8"/></svg>
        <div><div style="font-size:110px;font-weight:800;line-height:1">−15°</div><div style="font-size:26px;opacity:.9">Ressenti −24 °C</div></div>
      </div>
      <div style="font-size:30px;font-weight:700;margin-top:10px">Neige · 10 à 15 cm</div>
      <div style="font-size:22px;opacity:.85;margin-top:4px">Vents du nord-ouest à 30 km/h</div>
    </div>`
  },
  {
    nom: 'horaire-bibliotheque', l: 800, h: 760, fond: '#E8E4DC',
    html: `
    <div style="width:600px;background:#fff;border:3px solid #333;border-radius:12px;padding:38px 40px;box-shadow:0 16px 40px rgba(0,0,0,.16)">
      <div style="font-size:24px;font-weight:700;color:#555;letter-spacing:2px">BIBLIOTHÈQUE MUNICIPALE</div>
      <div style="font-size:44px;font-weight:900;margin:8px 0 24px">Heures d'ouverture</div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:14px;font-size:28px">
        <span>Lundi</span><b style="color:#C8102E">FERMÉ</b>
        <span>Mardi au vendredi</span><b>10 h – 20 h</b>
        <span>Samedi et dimanche</span><b>10 h – 17 h</b>
      </div>
    </div>`
  },
  {
    nom: 'panneau-depart', l: 900, h: 560, fond: '#2A2A2A',
    html: `
    <div style="width:760px;background:#111;border-radius:12px;padding:28px 32px;font-family:'Roboto Mono', monospace;color:#FFD34D;box-shadow:0 20px 50px rgba(0,0,0,.4)">
      <div style="font-size:22px;color:#aaa;letter-spacing:3px;margin-bottom:18px">DÉPARTS · GARE D'AUTOCARS</div>
      <div style="display:grid;grid-template-columns:110px 1fr 130px 170px;gap:12px;font-size:26px;color:#aaa;border-bottom:2px solid #333;padding-bottom:10px">
        <span>HEURE</span><span>DESTINATION</span><span>QUAI</span><span>ÉTAT</span>
      </div>
      <div style="display:grid;grid-template-columns:110px 1fr 130px 170px;gap:12px;font-size:30px;padding:14px 0;border-bottom:1px solid #222">
        <span>14:30</span><span>MONTRÉAL</span><span>3</span><span style="color:#FF5A4D">RETARDÉ 15:10</span>
      </div>
      <div style="display:grid;grid-template-columns:110px 1fr 130px 170px;gap:12px;font-size:30px;padding:14px 0">
        <span>14:45</span><span>SHERBROOKE</span><span>5</span><span style="color:#7EE2A8">À L'HEURE</span>
      </div>
    </div>`
  }
];

for (const d of DOCUMENTS) {
  const html = `<!DOCTYPE html><html lang="fr-CA"><head><meta charset="utf-8">${BASE}
    <style>html,body{width:${d.l}px;height:${d.h}px;overflow:hidden;background:${d.fond};}</style></head><body>${d.html}</body></html>`;
  const fichierHtml = path.join(TEMP, d.nom + '.html');
  const fichierPng = path.join(SORTIE, d.nom + '.png');
  fs.writeFileSync(fichierHtml, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${d.l},${d.h}`, '--virtual-time-budget=5000', `--screenshot=${fichierPng}`,
    'file:///' + fichierHtml.replace(/\\/g, '/')], { stdio: 'ignore' });
  console.log('✓', d.nom + '.png', Math.round(fs.statSync(fichierPng).size / 1024) + ' Ko');
}
fs.rmSync(TEMP, { recursive: true, force: true });
