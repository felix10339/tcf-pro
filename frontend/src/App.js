import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Quiz from './pages/Quiz';
import Dashboard from './pages/Dashboard';
import Inscription from './pages/Inscription';
import Accueil from './pages/Accueil';
import Simulateur from './pages/Simulateur';
import ExpressionEcrite from './pages/ExpressionEcrite';
import ExpressionOrale from './pages/ExpressionOrale';
import Tarifs from './pages/Tarifs';
import PaiementSucces from './pages/PaiementSucces';
import Admin from './pages/Admin';
import Profil from './pages/Profil';

function AppContent() {
  
  const [sectionActive, setSectionActive] = useState(null);
  const [page, setPage] = useState('accueil');

  useEffect(() => {
    const u = localStorage.getItem('utilisateur');
    if (u) { setUtilisateur(JSON.parse(u)); setPage('app'); }
  }, []);

  const seDeconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
    setSectionActive(null);
    setPage('accueil');
  };

  const onConnecte = (u) => { setUtilisateur(u); setPage('app'); };

  const onMisAJour = useCallback((u) => {
    setUtilisateur(u);
    localStorage.setItem('utilisateur', JSON.stringify(u));
    setPage('app');
  }, []);

  if (page === 'accueil') return <Accueil onCommencer={() => setPage('auth')} />;
  if (page === 'auth' || !utilisateur) return <Inscription onConnecte={onConnecte} />;

  const estPro = utilisateur?.abonnement === 'pro';
  const estAdmin = utilisateur?.email === 'admin@tcfpro.com';

  const navbar = (
    <div style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <span onClick={() => { setSectionActive(null); setPage('app'); }} style={{ fontWeight: '800', fontSize: '18px', cursor: 'pointer', letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        TCFPro 🇫🇷
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {estAdmin && (
          <button onClick={() => setPage('admin')} style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #7F77DD, #5A52B5)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
            ⚙️ Admin
          </button>
        )}
        {!estPro && (
          <button onClick={() => setPage('tarifs')} style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', boxShadow: '0 2px 8px rgba(29,158,117,0.3)' }}>
            ⭐ Passer Pro
          </button>
        )}
        {estPro && (
          <div style={{ background: 'linear-gradient(135deg, #E1F5EE, #C8F0E0)', color: '#0F6E56', fontSize: '11px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px', border: '1px solid #9FE1CB' }}>
            ✅ Pro
          </div>
        )}
        <button onClick={() => setPage('profil')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', border: 'none', borderRadius: '20px', padding: '6px 12px 6px 6px', cursor: 'pointer', transition: 'background 0.18s', transform: 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '800' }}>
            {utilisateur.nom.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{utilisateur.nom.split(' ')[0]}</span>
        </button>
        <button onClick={seDeconnecter} style={{ fontSize: '13px', color: '#EF4444', background: 'none', border: '1px solid #FCA5A5', borderRadius: '8px', cursor: 'pointer', padding: '6px 12px', fontWeight: '500' }}>
          Déconnexion
        </button>
      </div>
    </div>
  );

  const naviguerSection = (section) => {
    if (!estPro && (section === 'expression-ecrite' || section === 'expression-orale')) {
      setPage('tarifs'); return;
    }
    if (section === 'expression-ecrite') setPage('expression-ecrite');
    else if (section === 'expression-orale') setPage('expression-orale');
    else setSectionActive(section);
  };

  const PagePro = ({ children }) => {
    if (!estPro) return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Fonctionnalité Pro</h2>
          <p style={{ color: '#6b7280', marginBottom: '28px', lineHeight: '1.7' }}>
            Cette fonctionnalité est réservée aux membres Pro. Passez à la version Pro pour débloquer toutes les épreuves.
          </p>
          <button onClick={() => setPage('tarifs')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 15px rgba(29,158,117,0.3)' }}>
            ⭐ Voir les plans Pro →
          </button>
        </div>
      </div>
    );
    return children;
  };

  return (
    <>
      {navbar}
      {page === 'profil'
        ? <Profil utilisateur={utilisateur} onMisAJour={onMisAJour} onRetour={() => setPage('app')} onTarifs={() => setPage('tarifs')} />
        : page === 'admin'
        ? <Admin onRetour={() => setPage('app')} />
        : page === 'tarifs'
        ? <Tarifs utilisateur={utilisateur} onRetour={() => setPage('app')} />
        : page === 'simulateur'
        ? <PagePro><Simulateur utilisateur={utilisateur} onRetour={() => setPage('app')} /></PagePro>
        : page === 'expression-ecrite'
        ? <PagePro><ExpressionEcrite onRetour={() => setPage('app')} utilisateur={utilisateur} /></PagePro>
        : page === 'expression-orale'
        ? <PagePro><ExpressionOrale onRetour={() => setPage('app')} utilisateur={utilisateur} /></PagePro>
        : sectionActive
        ? <Quiz section={sectionActive} utilisateur={utilisateur} onRetourDashboard={() => setSectionActive(null)} />
        : <Dashboard utilisateur={utilisateur} onCommencerQuiz={naviguerSection} onSimulateur={() => estPro ? setPage('simulateur') : setPage('tarifs')} onTarifs={() => setPage('tarifs')} />
      }
    </>
  );
}

function App() {
  const [utilisateur, setUtilisateur] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('utilisateur');
    if (u) setUtilisateur(JSON.parse(u));
  }, []);

  const onMisAJour = useCallback((u) => {
    setUtilisateur(u);
    localStorage.setItem('utilisateur', JSON.stringify(u));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/paiement-succes" element={<PaiementSucces onMisAJour={onMisAJour} />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;