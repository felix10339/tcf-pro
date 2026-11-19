import { useEffect, useRef, useState } from 'react';

// Bouton officiel « Continuer avec Google » (Google Identity Services).
// Affiché seulement si REACT_APP_GOOGLE_CLIENT_ID est défini. onJeton reçoit le jeton d'identité à vérifier côté serveur.
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCRIPT = 'https://accounts.google.com/gsi/client';

let chargement;
function chargerScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!chargement) {
    chargement = new Promise((ok, echec) => {
      const s = document.createElement('script');
      s.src = SCRIPT; s.async = true; s.defer = true;
      s.onload = ok;
      s.onerror = () => { chargement = null; echec(new Error('Script Google non chargé')); };
      document.head.appendChild(s);
    });
  }
  return chargement;
}

export default function BoutonGoogle({ onJeton, texte = 'continue_with' }) {
  const conteneur = useRef(null);
  const rappel = useRef(onJeton);
  const [indisponible, setIndisponible] = useState(false);
  rappel.current = onJeton;

  useEffect(() => {
    if (!CLIENT_ID) return;
    let actif = true;
    chargerScript().then(() => {
      if (!actif || !conteneur.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: r => rappel.current(r.credential),
        ux_mode: 'popup',
        context: texte === 'signup_with' ? 'signup' : 'signin'
      });
      const largeur = Math.min(400, conteneur.current.offsetWidth || 400);
      window.google.accounts.id.renderButton(conteneur.current, {
        type: 'standard', theme: 'outline', size: 'large', shape: 'rectangular',
        text: texte, logo_alignment: 'center', locale: 'fr', width: largeur
      });
    }).catch(() => actif && setIndisponible(true));
    return () => { actif = false; };
  }, [texte]);

  if (!CLIENT_ID || indisponible) return null;
  return (
    <>
      <div ref={conteneur} style={{ width: '100%', minHeight: 44, display: 'flex', justifyContent: 'center' }} />
      <div className="ligne gap-2 tres-petit texte-3" style={{ margin: '18px 0', alignItems: 'center' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--bordure, #E5E7EB)' }} />
        ou avec votre adresse courriel
        <span style={{ flex: 1, height: 1, background: 'var(--bordure, #E5E7EB)' }} />
      </div>
    </>
  );
}

export const googleActif = Boolean(CLIENT_ID);
