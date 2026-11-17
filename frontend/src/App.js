import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config';
import Accueil from './pages/Accueil';
import Inscription from './pages/Inscription';
import Dashboard from './pages/Dashboard';
import Logo from './components/Logo';
import Icone from './components/Icone';

// Pages chargées à la demande : le premier affichage ne télécharge que l'essentiel.
const Quiz = lazy(() => import('./pages/Quiz'));
const Simulateur = lazy(() => import('./pages/Simulateur'));
const ExpressionEcrite = lazy(() => import('./pages/ExpressionEcrite'));
const ExpressionOrale = lazy(() => import('./pages/ExpressionOrale'));
const Tarifs = lazy(() => import('./pages/Tarifs'));
const PaiementSucces = lazy(() => import('./pages/PaiementSucces'));
const Admin = lazy(() => import('./pages/Admin'));
const Profil = lazy(() => import('./pages/Profil'));
const Conseils = lazy(() => import('./pages/Conseils'));

const Chargement = () => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Chargement">
    <div className="chargeur" />
  </div>
);

function App() {
  const [utilisateur, setUtilisateur] = useState(null);
  const [sectionActive, setSectionActive] = useState(null);
  const [page, setPage] = useState('accueil');
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('utilisateur');
    const token = localStorage.getItem('token');
    if (!u || !token) return;
    setUtilisateur(JSON.parse(u)); setPage('app');

    // Le statut Pro enregistré dans le navigateur peut être périmé (paiement, renouvellement, annulation,
    // expiration) : on le relit sur le serveur à chaque ouverture et quand l'onglet redevient visible.
    const rafraichir = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/moi`, { headers: { Authorization: `Bearer ${token}` } });
        setUtilisateur(res.data.utilisateur);
        localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
      } catch (err) {
        if (err.response?.status === 401) { // session expirée : retour à la connexion
          localStorage.removeItem('token'); localStorage.removeItem('utilisateur');
          setUtilisateur(null); setPage('auth');
        }
      }
    };
    rafraichir();
    const surVisibilite = () => { if (document.visibilityState === 'visible') rafraichir(); };
    document.addEventListener('visibilitychange', surVisibilite);
    return () => document.removeEventListener('visibilitychange', surVisibilite);
  }, []);

  const seDeconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
    setSectionActive(null);
    setPage('accueil');
    setMenuMobileOuvert(false);
  };

  const onConnecte = (u) => { setUtilisateur(u); setPage('app'); };

  const onMisAJour = useCallback((u) => {
    setUtilisateur(u);
    if (u) localStorage.setItem('utilisateur', JSON.stringify(u));
    setPage('app');
  }, []);

  // Ouvre le guide de conseils, éventuellement sur une rubrique précise
  const [ongletConseils, setOngletConseils] = useState('generale');
  const ouvrirConseils = (rubrique = 'generale') => { setOngletConseils(rubrique); naviguer('conseils'); };

  const naviguer = (p) => {
    setPage(p);
    setMenuMobileOuvert(false);
    setSectionActive(null);
    window.scrollTo(0, 0);
  };

  if (page === 'accueil') return <Accueil onCommencer={() => setPage('auth')} />;
  if (page === 'auth' || !utilisateur) return <Inscription onConnecte={onConnecte} onRetour={() => setPage('accueil')} />;

  const estPro = utilisateur?.abonnement === 'pro';
  const estAdmin = utilisateur?.email === 'admin@tcfpro.com';
  const prenom = utilisateur.nom?.split(' ')[0] || '';

  const liens = [
    { id: 'app', label: 'Tableau de bord' },
    { id: 'simulateur', label: 'Examen blanc', pro: true },
    { id: 'conseils', label: 'Conseils' },
    { id: 'profil', label: 'Mon profil' },
    ...(estAdmin ? [{ id: 'admin', label: 'Admin' }] : [])
  ];
  const ouvrir = id => (id === 'simulateur' && !estPro ? naviguer('tarifs') : naviguer(id));
  const actif = id => page === id && !sectionActive;

  const navbar = (
    <nav className="nav">
      <div className="conteneur nav-interieur">
        <Logo onClick={() => naviguer('app')} />

        <div className="nav-liens desktop-only">
          {liens.map(l => (
            <button key={l.id} className={`nav-lien${actif(l.id) ? ' actif' : ''}`} onClick={() => ouvrir(l.id)} aria-current={actif(l.id) ? 'page' : undefined}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="ligne gap-2">
          {estPro
            ? <span className="badge badge-succes desktop-only"><Icone nom="etoile" taille={12} /> Pro</span>
            : <button className="btn btn-primaire btn-petit desktop-only" onClick={() => naviguer('tarifs')}>Passer Pro</button>}
          <button className="ligne gap-1 desktop-only" onClick={() => naviguer('profil')} aria-label="Mon profil"
            style={{ background: 'none', border: 'none', padding: 4, borderRadius: 999 }}>
            <span className="avatar">{prenom.charAt(0).toUpperCase()}</span>
          </button>
          <button className="btn btn-lien btn-petit desktop-only" onClick={seDeconnecter} title="Se déconnecter" aria-label="Se déconnecter">
            <Icone nom="sortie" taille={18} />
          </button>
          <button className="btn btn-lien mobile-only" onClick={() => setMenuMobileOuvert(o => !o)} aria-label="Menu" aria-expanded={menuMobileOuvert}>
            <Icone nom={menuMobileOuvert ? 'croix' : 'menu'} taille={22} />
          </button>
        </div>
      </div>

      {menuMobileOuvert && (
        <div className="menu-mobile mobile-only">
          <div className="ligne gap-2" style={{ padding: '8px 12px 14px', borderBottom: '1px solid var(--bordure)', marginBottom: 6 }}>
            <span className="avatar">{prenom.charAt(0).toUpperCase()}</span>
            <div>
              <div className="gras">{utilisateur.nom}</div>
              <div className="tres-petit texte-3">{estPro ? 'Membre Pro' : 'Compte gratuit'}</div>
            </div>
          </div>
          {liens.map(l => <button key={l.id} className={`nav-lien${actif(l.id) ? ' actif' : ''}`} onClick={() => ouvrir(l.id)}>{l.label}</button>)}
          {!estPro && <button className="btn btn-primaire" style={{ marginTop: 8 }} onClick={() => naviguer('tarifs')}>Passer Pro</button>}
          <button className="nav-lien" style={{ color: 'var(--erreur)' }} onClick={seDeconnecter}>Se déconnecter</button>
        </div>
      )}
    </nav>
  );

  const naviguerSection = (section) => {
    setMenuMobileOuvert(false);
    if (!estPro && (section === 'expression-ecrite' || section === 'expression-orale')) {
      setPage('tarifs'); return;
    }
    if (section === 'expression-ecrite') setPage('expression-ecrite');
    else if (section === 'expression-orale') setPage('expression-orale');
    else setSectionActive(section);
  };

  const PagePro = ({ children }) => {
    if (!estPro) return (
      <div className="conteneur-etroit section centre">
        <span className="pastille-icone" style={{ width: 64, height: 64, background: 'var(--action-pale)', color: 'var(--action)', marginBottom: 20 }}>
          <Icone nom="cadenas" taille={28} />
        </span>
        <h2 className="titre-1" style={{ marginBottom: 10 }}>Fonctionnalité Pro</h2>
        <p className="texte-2" style={{ marginBottom: 28 }}>L'examen blanc complet et les corrections par IA sont réservés aux membres Pro.</p>
        <button className="btn btn-primaire btn-grand" onClick={() => setPage('tarifs')}>Voir les forfaits <Icone nom="fleche" taille={18} /></button>
      </div>
    );
    return children;
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<Chargement />}>
        <Routes>
          <Route path="/paiement-succes" element={<PaiementSucces onMisAJour={onMisAJour} />} />
          <Route path="*" element={
            <>
              {navbar}
              {page === 'conseils' ? <Conseils onRetour={() => naviguer('app')} ongletInitial={ongletConseils} />
              : page === 'profil' ? <Profil utilisateur={utilisateur} onMisAJour={onMisAJour} onRetour={() => naviguer('app')} onTarifs={() => naviguer('tarifs')} />
              : page === 'admin' ? <Admin onRetour={() => naviguer('app')} />
              : page === 'tarifs' ? <Tarifs utilisateur={utilisateur} onRetour={() => naviguer('app')} />
              : page === 'simulateur' ? <PagePro><Simulateur utilisateur={utilisateur} onRetour={() => naviguer('app')} /></PagePro>
              : page === 'expression-ecrite' ? <PagePro><ExpressionEcrite onRetour={() => naviguer('app')} utilisateur={utilisateur} /></PagePro>
              : page === 'expression-orale' ? <PagePro><ExpressionOrale onRetour={() => naviguer('app')} utilisateur={utilisateur} /></PagePro>
              : sectionActive ? <Quiz section={sectionActive} utilisateur={utilisateur} onRetourDashboard={() => setSectionActive(null)} />
              : <Dashboard utilisateur={utilisateur} onCommencerQuiz={naviguerSection} onSimulateur={() => estPro ? naviguer('simulateur') : naviguer('tarifs')} onTarifs={() => naviguer('tarifs')} onConseils={ouvrirConseils} />}
            </>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
