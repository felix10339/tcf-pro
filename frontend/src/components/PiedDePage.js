import Logo from './Logo';
import Icone from './Icone';
import { COURRIEL, COURRIEL_LIEN, WHATSAPP_AFFICHE, WHATSAPP_LIEN, TIKTOK_LIEN } from '../data/contact';

// Pied de page commun à tout le site.
// Les liens de navigation interne sont fournis par la page (callbacks) ; sinon ils ramènent à l'accueil.
function PiedDePage({ onAccueil, onEpreuves, onDemo, onConseils, onCommencer }) {
  const annee = new Date().getFullYear();
  const lien = { color: 'rgba(255,255,255,0.72)', textDecoration: 'none', background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' };
  const titre = { fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', marginBottom: 14 };
  const versAccueil = () => { if (onAccueil) onAccueil(); else window.location.href = '/'; };
  const bouton = (libelle, action) => <li><button type="button" style={lien} onClick={action || versAccueil}>{libelle}</button></li>;

  return (
    <footer style={{ background: '#081629', color: 'rgba(255,255,255,0.6)', paddingTop: 56 }}>
      <div className="conteneur grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 36, paddingBottom: 40 }}>
        {/* Marque et contact */}
        <div style={{ gridColumn: 'span 1', minWidth: 220 }}>
          <Logo clair onClick={versAccueil} />
          <p className="petit" style={{ marginTop: 14, lineHeight: 1.7, maxWidth: 300 }}>
            La préparation au TCF Canada pensée pour les candidats à l'immigration : examens blancs, NCLC et corrections par IA.
          </p>
          <ul className="pile gap-2 petit" style={{ listStyle: 'none', marginTop: 18 }}>
            <li><a href={WHATSAPP_LIEN} target="_blank" rel="noopener noreferrer" className="ligne gap-1" style={lien}><Icone nom="bulle" taille={15} /> {WHATSAPP_AFFICHE}</a></li>
            <li><a href={COURRIEL_LIEN} className="ligne gap-1" style={lien}><Icone nom="courriel" taille={15} /> {COURRIEL}</a></li>
            {TIKTOK_LIEN && <li><a href={TIKTOK_LIEN} target="_blank" rel="noopener noreferrer" className="ligne gap-1" style={lien}><Icone nom="musique" taille={15} /> TikTok</a></li>}
          </ul>
        </div>

        {/* Préparation */}
        <nav aria-label="Préparation">
          <p style={titre}>Préparation</p>
          <ul className="pile gap-2 petit" style={{ listStyle: 'none' }}>
            {bouton('Les 4 épreuves', onEpreuves)}
            {bouton('Démo du simulateur', onDemo)}
            {bouton('Créer un compte gratuit', onCommencer)}
          </ul>
        </nav>

        {/* Ressources */}
        <nav aria-label="Ressources">
          <p style={titre}>Ressources</p>
          <ul className="pile gap-2 petit" style={{ listStyle: 'none' }}>
            {bouton('Guide de méthode', onConseils ? () => onConseils('generale') : null)}
            {bouton('Objectifs NCLC', onConseils ? () => onConseils('nclc') : null)}
            {bouton('Expressions utiles', onConseils ? () => onConseils('outils') : null)}
          </ul>
        </nav>

        {/* Informations légales */}
        <nav aria-label="Informations légales">
          <p style={titre}>Informations légales</p>
          <ul className="pile gap-2 petit" style={{ listStyle: 'none' }}>
            <li><a href="/conditions" style={lien}>Conditions d'utilisation</a></li>
            <li><a href="/confidentialite" style={lien}>Politique de confidentialité</a></li>
            <li><a href="/remboursement" style={lien}>Remboursement et annulation</a></li>
          </ul>
        </nav>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="conteneur ligne entre envelopper gap-2 tres-petit" style={{ padding: '18px 20px', lineHeight: 1.6 }}>
          <span>© {annee} TCF Pro · Felix Chatue. Tous droits réservés.</span>
          <span style={{ maxWidth: 620 }}>
            Plateforme indépendante, non affiliée à France Éducation international ni à IRCC. Le TCF Canada est un test conçu par France Éducation international.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default PiedDePage;
