import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

function PaiementSucces({ onMisAJour }) {
  const [searchParams] = useSearchParams();
  const [statut, setStatut] = useState('verification');
  const [tentatives, setTentatives] = useState(0);
  const sessionId = searchParams.get('session_id');
  const dejaVerifie = useRef(false);

  useEffect(() => {
    if (!sessionId || dejaVerifie.current) return;
    dejaVerifie.current = true;

    const verifier = async (essai = 0) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setStatut('erreur'); return; }

        setTentatives(essai + 1);

        const res = await axios.get(
          API_URL + '/api/paiement/verifier-session/' + sessionId,
          { headers: { Authorization: 'Bearer ' + token } }
        );

        if (res.data.succes) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
          onMisAJour(res.data.utilisateur);
          setStatut('succes');
        } else if (essai < 5) {
          setTimeout(() => verifier(essai + 1), 2000);
        } else {
          setStatut('erreur');
        }
      } catch (err) {
        console.error('Erreur vérification:', err);
        if (essai < 3) {
          setTimeout(() => verifier(essai + 1), 2000);
        } else {
          setStatut('erreur');
        }
      }
    };

    verifier(0);
  }, [sessionId, onMisAJour]);

  if (statut === 'verification') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Activation de votre abonnement...</h2>
        <p style={{ color: '#888', marginBottom: '16px' }}>
          Vérification du paiement {tentatives > 0 ? '(tentative ' + tentatives + ')' : ''}
        </p>
        <div style={{ height: '4px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#1D9E75', borderRadius: '4px', animation: 'loading 1.5s ease-in-out infinite', width: '60%' }} />
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
      </div>
    </div>
  );

  if (statut === 'succes') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%', background: '#fff', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#E1F5EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 20px' }}>🎉</div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#0F6E56' }}>Bienvenue dans TCFPro !</h2>
        <p style={{ fontSize: '15px', color: '#666', marginBottom: '28px', lineHeight: '1.7' }}>
          Votre paiement a été confirmé et votre compte Pro est maintenant actif !
        </p>
        <div style={{ background: '#E1F5EE', borderRadius: '14px', padding: '18px', marginBottom: '28px', textAlign: 'left' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F6E56', marginBottom: '10px' }}>✅ Fonctionnalités débloquées :</p>
          {[
            'Compréhension écrite et orale illimitées',
            'Expression écrite avec correction IA',
            'Expression orale avec correction IA',
            'Simulateur d\'examen complet (4 épreuves)',
            'Explications IA personnalisées'
          ].map((f, i) => (
            <div key={i} style={{ fontSize: '13px', color: '#085041', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1D9E75', fontWeight: '700' }}>✓</span> {f}
            </div>
          ))}
        </div>
        <button onClick={() => window.location.href = '/'}
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>
          Commencer à s'entraîner →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%', background: '#fff', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Vérification en attente</h2>
        <p style={{ color: '#666', marginBottom: '8px', lineHeight: '1.6' }}>
          Votre paiement a bien été reçu mais la synchronisation prend un peu plus de temps.
        </p>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>
          Reconnectez-vous dans quelques secondes — votre compte Pro sera activé.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.location.reload()}
            style={{ flex: 1, padding: '12px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            Réessayer
          </button>
          <button onClick={() => window.location.href = '/'}
            style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#444' }}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaiementSucces;