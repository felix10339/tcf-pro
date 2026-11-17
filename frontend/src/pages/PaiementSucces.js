import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import Logo from '../components/Logo';
import Icone from '../components/Icone';

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

  const AVANTAGES = [
    'Examen blanc complet au format officiel, avec résultat en NCLC',
    'Expression écrite : 3 tâches corrigées par IA',
    'Expression orale : 3 tâches corrigées par IA',
    'Explication personnalisée par IA après chaque réponse'
  ];

  const cadre = contenu => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--fond)' }}>
      <div style={{ marginBottom: 24 }}><Logo onClick={() => { window.location.href = '/'; }} /></div>
      <div className="carte centre" style={{ maxWidth: 480, width: '100%', padding: 'clamp(28px, 5vw, 40px)', boxShadow: 'var(--ombre-2)' }}>{contenu}</div>
    </div>
  );

  if (statut === 'verification') return cadre(
    <>
      <div className="chargeur" style={{ margin: '0 auto 18px' }} />
      <h1 className="titre-2" style={{ marginBottom: 6 }}>Activation de votre abonnement…</h1>
      <p className="texte-3">Vérification du paiement{tentatives > 1 ? ` (tentative ${tentatives})` : ''}</p>
    </>
  );

  if (statut === 'succes') return cadre(
    <>
      <span className="pastille-icone" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--succes-pale)', color: 'var(--succes)', marginBottom: 16 }}>
        <Icone nom="coche" taille={30} epaisseur={2.5} />
      </span>
      <h1 className="titre-1" style={{ marginBottom: 8 }}>Bienvenue dans TCF Pro !</h1>
      <p className="texte-2" style={{ marginBottom: 22 }}>Votre paiement est confirmé et votre compte Pro est actif.</p>
      <ul className="pile gap-2" style={{ listStyle: 'none', textAlign: 'left', padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)', marginBottom: 24 }}>
        {AVANTAGES.map(a => (
          <li key={a} className="ligne gap-2 petit" style={{ alignItems: 'flex-start' }}>
            <Icone nom="coche" taille={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--succes)' }} />{a}
          </li>
        ))}
      </ul>
      <button className="btn btn-primaire btn-grand btn-plein" onClick={() => { window.location.href = '/'; }}>Commencer à m'entraîner <Icone nom="fleche" taille={18} /></button>    </>
  );

  return cadre(
    <>
      <span className="pastille-icone" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--alerte-pale)', color: 'var(--alerte)', marginBottom: 16 }}>
        <Icone nom="chrono" taille={28} />
      </span>
      <h1 className="titre-2" style={{ marginBottom: 8 }}>Activation en cours</h1>
      <p className="texte-2" style={{ marginBottom: 6 }}>Votre paiement est enregistré, mais la confirmation prend un peu plus de temps que prévu.</p>
      <p className="petit texte-3" style={{ marginBottom: 24 }}>Votre compte Pro sera activé automatiquement d'ici quelques instants. Aucun nouveau paiement n'est nécessaire.</p>
      <div className="ligne gap-2">
        <button className="btn btn-nuit" style={{ flex: 1 }} onClick={() => window.location.reload()}>Réessayer</button>
        <button className="btn btn-contour" style={{ flex: 1 }} onClick={() => { window.location.href = '/'; }}>Retour au site</button>
      </div>
    </>
  );
}

export default PaiementSucces;