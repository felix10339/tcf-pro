import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

function Inscription({ onConnecte }) {
  const [mode, setMode] = useState('connexion');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const soumettre = async () => {
    setErreur('');
    setChargement(true);
    try {
      const url = mode === 'inscription'
        ? API_URL + '/api/auth/inscription'
        : API_URL + '/api/auth/connexion';

      const body = mode === 'inscription'
        ? { nom, email, motDePasse }
        : { email, motDePasse };

      const res = await axios.post(url, body);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
      onConnecte(res.data.utilisateur);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setChargement(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') soumettre(); };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#1D9E75', borderRadius: '16px', fontSize: '24px', marginBottom: '12px' }}>🇫🇷</div>
          <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            TCF<span style={{ color: '#1D9E75' }}>Pro</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>Préparez votre TCF avec l'intelligence artificielle</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', background: '#f4f6f8', borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
            {['connexion', 'inscription'].map(m => (
              <button key={m} onClick={() => { setMode(m); setErreur(''); }}
                style={{ flex: 1, padding: '9px', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#1a1a2e' : '#888', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: mode === m ? '600' : '400', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transform: 'none' }}>
                {m === 'connexion' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {mode === 'inscription' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Nom complet</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ex : Amara Diallo"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Adresse email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="votre@email.com"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Mot de passe</label>
            <input type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', boxSizing: 'border-box' }} />
          </div>

          {erreur && (
            <div style={{ background: '#fff5f5', border: '1.5px solid #fed7d7', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#c53030', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {erreur}
            </div>
          )}

          <button onClick={soumettre} disabled={chargement}
            style={{ width: '100%', padding: '13px', background: chargement ? '#ccc' : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '10px', cursor: chargement ? 'default' : 'pointer', fontSize: '15px', fontWeight: '600', boxShadow: chargement ? 'none' : '0 4px 15px rgba(29,158,117,0.35)' }}>
            {chargement ? '⏳ Chargement...' : mode === 'connexion' ? 'Se connecter →' : 'Créer mon compte →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#aaa', marginTop: '20px' }}>
            {mode === 'connexion' ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <span onClick={() => { setMode(mode === 'connexion' ? 'inscription' : 'connexion'); setErreur(''); }}
              style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: '600' }}>
              {mode === 'connexion' ? "S'inscrire" : "Se connecter"}
            </span>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '20px' }}>
          🔒 Vos données sont sécurisées
        </p>
      </div>
    </div>
  );
}

export default Inscription;