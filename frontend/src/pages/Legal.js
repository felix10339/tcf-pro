import { useEffect } from 'react';
import Logo from '../components/Logo';
import Icone from '../components/Icone';
import PiedDePage from '../components/PiedDePage';
import { DOCUMENTS_LEGAUX, MISE_A_JOUR } from '../data/legal';
import { COURRIEL, COURRIEL_LIEN, WHATSAPP_AFFICHE, WHATSAPP_LIEN } from '../data/contact';

const AUTRES = [
  ['/conditions', 'Conditions d\'utilisation'],
  ['/confidentialite', 'Politique de confidentialité'],
  ['/remboursement', 'Remboursement et annulation']
];

// Pages légales publiques : /conditions, /confidentialite, /remboursement
function Legal({ chemin }) {
  const doc = DOCUMENTS_LEGAUX[chemin];

  useEffect(() => {
    document.title = `${doc.titre} · TCF Pro`;
    window.scrollTo(0, 0);
    return () => { document.title = 'TCF Pro — Préparation au TCF Canada'; };
  }, [doc]);

  return (
    <div>
      <nav className="nav">
        <div className="conteneur nav-interieur">
          <a href="/" style={{ textDecoration: 'none' }}><Logo /></a>
          <a href="/" className="btn btn-primaire btn-petit" style={{ textDecoration: 'none' }}>Aller sur TCF Pro</a>
        </div>
      </nav>

      <header className="entete-page">
        <div className="conteneur" style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <a href="/" className="btn btn-lien btn-petit" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 10, paddingLeft: 0, textDecoration: 'none' }}>
            <Icone nom="retour" taille={16} /> Accueil
          </a>
          <p className="petit" style={{ opacity: 0.65, marginBottom: 4 }}>Informations légales</p>
          <h1 className="titre-1">{doc.titre}</h1>
          <p className="petit" style={{ opacity: 0.65, marginTop: 8 }}>Dernière mise à jour : {MISE_A_JOUR}</p>
        </div>
      </header>

      <main className="conteneur chevauche" style={{ maxWidth: 820, paddingBottom: 56 }}>
        <article className="carte" style={{ padding: 'clamp(22px, 4vw, 40px)' }}>
          <p className="texte-intro" style={{ marginBottom: 28 }}>{doc.intro}</p>

          {doc.sections.map(s => (
            <section key={s.titre} style={{ marginBottom: 26 }}>
              <h2 className="titre-3" style={{ fontSize: '1.15rem', marginBottom: 10 }}>{s.titre}</h2>
              {(s.texte || []).map((p, i) => <p key={i} className="texte-2" style={{ marginBottom: 10, lineHeight: 1.75 }}>{p}</p>)}
              {s.liste && (
                <ul className="pile gap-2" style={{ paddingLeft: 22, marginBottom: 10 }}>
                  {s.liste.map((p, i) => <li key={i} className="texte-2" style={{ lineHeight: 1.7 }}>{p}</li>)}
                </ul>
              )}
              {s.apres && <p className="texte-2" style={{ lineHeight: 1.75 }}>{s.apres}</p>}
            </section>
          ))}

          <section id="nous-joindre" style={{ marginTop: 32, padding: 20, background: 'var(--surface-2)', borderRadius: 'var(--rayon)' }}>
            <h2 className="titre-3" style={{ marginBottom: 6 }}>Vous joindre</h2>
            <p className="petit texte-2" style={{ marginBottom: 12 }}>Felix Chatue, fondateur et responsable de la protection des renseignements personnels de TCF Pro.</p>
            <div className="ligne envelopper gap-2">
              <a className="btn btn-contour btn-petit" href={COURRIEL_LIEN} style={{ textDecoration: 'none' }}><Icone nom="courriel" taille={16} /> {COURRIEL}</a>
              <a className="btn btn-contour btn-petit" href={WHATSAPP_LIEN} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}><Icone nom="bulle" taille={16} /> WhatsApp · {WHATSAPP_AFFICHE}</a>
            </div>
          </section>
        </article>

        <nav aria-label="Autres documents" className="ligne envelopper gap-2" style={{ marginTop: 20 }}>
          {AUTRES.filter(([c]) => c !== chemin).map(([c, l]) => (
            <a key={c} href={c} className="btn btn-contour btn-petit" style={{ textDecoration: 'none' }}>{l} <Icone nom="fleche" taille={14} /></a>
          ))}
        </nav>
      </main>

      <PiedDePage />
    </div>
  );
}

export default Legal;
