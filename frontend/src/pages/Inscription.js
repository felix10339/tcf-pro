import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import Logo from '../components/Logo';
import Icone from '../components/Icone';

const ATOUTS = [
  { icone: 'cible', texte: 'Examens blancs au format officiel du TCF Canada' },
  { icone: 'graphique', texte: 'Résultats convertis en NCLC, épreuve par épreuve' },
  { icone: 'etincelle', texte: 'Rédactions et oraux corrigés par l\'IA (Pro)' }
];

function Inscription({ onConnecte, onRetour }) {
  const [mode, setMode] = useState('connexion');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const changerMode = m => { setMode(m); setErreur(''); };

  const soumettre = async (e) => {
    e?.preventDefault();
    setErreur('');
    // Vérifications immédiates (le serveur vérifie de nouveau)
    if (mode === 'inscription' && !nom.trim()) { setErreur('Indiquez votre nom.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErreur('Adresse courriel invalide.'); return; }
    if (mode === 'inscription' && motDePasse.length < 8) { setErreur('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (!motDePasse) { setErreur('Saisissez votre mot de passe.'); return; }
    setChargement(true);
    try {
      const url = mode === 'inscription'
        ? API_URL + '/api/auth/inscription'
        : API_URL + '/api/auth/connexion';

      const body = mode === 'inscription'
        ? { nom: nom.trim(), email: email.trim().toLowerCase(), motDePasse }
        : { email: email.trim().toLowerCase(), motDePasse };

      const res = await axios.post(url, body);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
      onConnecte(res.data.utilisateur);
    } catch (err) {
      if (!err.response) {
        // Aucune réponse : le serveur est arrêté, l'URL est fausse, ou la connexion est coupée.
        setErreur('Impossible de joindre le serveur. Réessayez dans quelques instants.');
      } else {
        setErreur(err.response.data?.message || 'Une erreur est survenue');
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>
      {/* Panneau de marque (masqué sur mobile) */}
      <aside className="desktop-only" style={{ background: 'var(--nuit)', color: '#fff', padding: '48px clamp(32px, 5vw, 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <Logo clair onClick={onRetour} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="titre-1" style={{ marginBottom: 28, maxWidth: 420 }}>
            Sachez exactement où vous en êtes avant le jour J.
          </h2>
          <ul className="pile gap-3" style={{ listStyle: 'none' }}>
            {ATOUTS.map(a => (
              <li key={a.texte} className="ligne gap-2">
                <span className="pastille-icone" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                  <Icone nom={a.icone} taille={18} />
                </span>
                <span style={{ opacity: 0.9 }}>{a.texte}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="petit" style={{ opacity: 0.5 }}>Plateforme indépendante, non affiliée à IRCC.</p>
        <div aria-hidden="true" style={{ position: 'absolute', right: -140, bottom: -140, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.30), transparent 70%)' }} />
      </aside>

      {/* Formulaire */}
      <main style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 20px', background: 'var(--fond)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="mobile-only" style={{ marginBottom: 32 }}><Logo onClick={onRetour} /></div>

          <h1 className="titre-1" style={{ marginBottom: 6 }}>{mode === 'connexion' ? 'Bon retour !' : 'Créer votre compte'}</h1>
          <p className="texte-2" style={{ marginBottom: 24 }}>
            {mode === 'connexion' ? 'Connectez-vous pour reprendre votre préparation.' : 'Gratuit, sans carte bancaire.'}
          </p>

          <div className="segments" role="tablist" style={{ marginBottom: 24 }}>
            {[['connexion', 'Connexion'], ['inscription', 'Inscription']].map(([m, label]) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} className={`segment${mode === m ? ' actif' : ''}`} onClick={() => changerMode(m)}>{label}</button>
            ))}
          </div>

          <form onSubmit={soumettre} className="pile gap-3" noValidate>
            {mode === 'inscription' && (
              <div className="champ-groupe">
                <label className="champ-label" htmlFor="nom">Nom complet</label>
                <input id="nom" className="champ" type="text" autoComplete="name" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex. : Amara Diallo" />
              </div>
            )}
            <div className="champ-groupe">
              <label className="champ-label" htmlFor="email">Adresse courriel</label>
              <input id="email" className="champ" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" />
            </div>
            <div className="champ-groupe">
              <label className="champ-label" htmlFor="mdp">Mot de passe</label>
              <input id="mdp" className="champ" type="password" autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'} value={motDePasse} onChange={e => setMotDePasse(e.target.value)} placeholder={mode === 'inscription' ? '8 caractères minimum' : '••••••••'} />
              {mode === 'inscription' && motDePasse.length > 0 && motDePasse.length < 8 && (
                <span className="tres-petit texte-3">Encore {8 - motDePasse.length} caractère{8 - motDePasse.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {erreur && <div className="message-erreur" role="alert"><Icone nom="croix" taille={16} style={{ flexShrink: 0, marginTop: 2 }} />{erreur}</div>}

            <button type="submit" className="btn btn-primaire btn-grand btn-plein" disabled={chargement}>
              {chargement ? 'Un instant…' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
              {!chargement && <Icone nom="fleche" taille={18} />}
            </button>
          </form>

          <p className="centre petit texte-3" style={{ marginTop: 20 }}>
            {mode === 'connexion' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <button type="button" className="btn-lien gras" style={{ background: 'none', border: 'none', color: 'var(--action)', padding: 0 }}
              onClick={() => changerMode(mode === 'connexion' ? 'inscription' : 'connexion')}>
              {mode === 'connexion' ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </p>

          <p className="ligne gap-1 tres-petit texte-3" style={{ justifyContent: 'center', marginTop: 28 }}>
            <Icone nom="bouclier" taille={14} /> Mot de passe chiffré · Données protégées
          </p>
        </div>
      </main>
    </div>
  );
}

export default Inscription;
