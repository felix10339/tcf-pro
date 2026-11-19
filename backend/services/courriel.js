// Envoi des courriels transactionnels (bienvenue) par SMTP — Gmail avec un « mot de passe d'application » par défaut.
// Si SMTP_UTILISATEUR / SMTP_MOT_DE_PASSE ne sont pas définis, aucun courriel n'est envoyé (l'inscription fonctionne quand même).
const nodemailer = require('nodemailer');

const UTILISATEUR = (process.env.SMTP_UTILISATEUR || '').trim();
// Les mots de passe d'application Gmail s'affichent par groupes de 4 : on retire les espaces éventuels
const MOT_DE_PASSE = (process.env.SMTP_MOT_DE_PASSE || '').replace(/s+/g, '');
const SITE = process.env.FRONTEND_URL || 'https://tcf-pro.vercel.app';
const WHATSAPP = 'https://wa.me/237650014045';

const transport = UTILISATEUR && MOT_DE_PASSE
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOTE || 'smtp.gmail.com',
      port: +(process.env.SMTP_PORT || 465),
      secure: +(process.env.SMTP_PORT || 465) === 465,
      auth: { user: UTILISATEUR, pass: MOT_DE_PASSE }
    })
  : null;

const echapper = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function gabaritBienvenue(nom) {
  const prenom = echapper((nom || '').trim().split(/\s+/)[0] || 'et bienvenue');
  const etapes = [
    ['Faites un premier examen blanc', 'Il vous donne votre niveau NCLC de départ, épreuve par épreuve.'],
    ['Lisez le guide des conseils', 'Stratégies, structures et expressions utiles pour chaque épreuve.'],
    ['Entraînez-vous chaque jour', 'Quelques séries de questions suffisent pour progresser régulièrement.']
  ];
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F7F7F4;font-family:Arial,Helvetica,sans-serif;color:#0B1F3A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F4;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E5E7EB">
<tr><td style="background:#0B1F3A;padding:28px 32px;color:#ffffff">
  <div style="font-size:20px;font-weight:bold">TCF <span style="color:#D52B1E">Pro</span></div>
  <div style="font-size:26px;font-weight:bold;margin-top:18px">Bienvenue ${prenom === 'et bienvenue' ? '' : prenom + ' '}!</div>
  <div style="opacity:.8;margin-top:6px">Votre compte est prêt. Cap sur le NCLC 7 et plus.</div>
</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6">
  <p style="margin:0 0 18px">Merci de rejoindre TCF Pro, la préparation au TCF Canada au format officiel. Voici comment bien démarrer :</p>
  ${etapes.map(([t, d], i) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px"><tr>
    <td valign="top" style="width:30px"><div style="width:24px;height:24px;border-radius:12px;background:#1D4ED8;color:#fff;font-size:13px;font-weight:bold;text-align:center;line-height:24px">${i + 1}</div></td>
    <td><strong>${t}</strong><br><span style="color:#4B5563">${d}</span></td></tr></table>`).join('')}
  <p style="text-align:center;margin:26px 0"><a href="${SITE}" style="background:#1D4ED8;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:10px;font-weight:bold;display:inline-block">Commencer ma préparation</a></p>
  <div style="background:#F3F4F6;border-radius:10px;padding:16px 18px">
    <strong>Besoin d'une formation personnalisée ?</strong><br>
    <span style="color:#4B5563">Un accompagnement individuel pour atteindre votre NCLC cible. Écrivez-nous sur <a href="${WHATSAPP}" style="color:#1D4ED8">WhatsApp (+237 6 50 01 40 45)</a> ou répondez simplement à ce courriel.</span>
  </div>
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280">
  Vous recevez ce message parce qu'un compte TCF Pro vient d'être créé avec cette adresse.<br>
  TCF Pro est une plateforme indépendante, non affiliée à IRCC ni à France Éducation international.
</td></tr></table></td></tr></table></body></html>`;
  const texte = `Bienvenue sur TCF Pro !\n\nVotre compte est prêt. Pour bien démarrer :\n${etapes.map(([t, d], i) => `${i + 1}. ${t} — ${d}`).join('\n')}\n\nCommencer : ${SITE}\n\nBesoin d'une formation personnalisée ? WhatsApp : +237 6 50 01 40 45 (${WHATSAPP}) ou répondez à ce courriel.\n\nTCF Pro est une plateforme indépendante, non affiliée à IRCC.`;
  return { html, texte };
}

// N'interrompt jamais l'inscription : les erreurs sont seulement journalisées.
async function envoyerBienvenue({ email, nom }) {
  if (!transport) return;
  try {
    const { html, texte } = gabaritBienvenue(nom);
    await transport.sendMail({
      from: `"TCF Pro" <${UTILISATEUR}>`,
      to: email,
      subject: 'Bienvenue sur TCF Pro 🇨🇦 — votre préparation commence ici',
      text: texte,
      html
    });
  } catch (e) {
    console.error('Courriel de bienvenue non envoyé :', e.message);
  }
}

// Diagnostic sans divulgation : présence des variables et réponse du serveur SMTP (jamais le mot de passe)
async function etatCourriel() {
  const etat = { utilisateur: Boolean(UTILISATEUR), motDePasse: Boolean(MOT_DE_PASSE), longueurMotDePasse: MOT_DE_PASSE.length };
  if (!transport) return { ...etat, connexion: 'non configuré' };
  try { await transport.verify(); return { ...etat, connexion: 'ok' }; }
  catch (e) { return { ...etat, connexion: 'échec', erreur: (e.response || e.message || '').slice(0, 160) }; }
}

module.exports = { envoyerBienvenue, gabaritBienvenue, etatCourriel };
