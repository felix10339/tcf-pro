import Icone from './Icone';

// En-tête bleu nuit commun aux pages de l'espace connecté.
function EntetePage({ surTitre, titre, sousTitre, onRetour, libelleRetour = 'Tableau de bord', centre = false, children }) {
  return (
    <header className={`entete-page${centre ? ' centre' : ''}`}>
      <div className="conteneur" style={{ position: 'relative', zIndex: 1, maxWidth: 960 }}>
        {onRetour && (
          <button className="btn btn-lien btn-petit" onClick={onRetour} style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 10, paddingLeft: 0 }}>
            <Icone nom="retour" taille={16} /> {libelleRetour}
          </button>
        )}
        {surTitre && <p className="petit" style={{ opacity: 0.65, marginBottom: 4 }}>{surTitre}</p>}
        <h1 className="titre-1">{titre}</h1>
        {sousTitre && <p style={{ opacity: 0.75, marginTop: 8, maxWidth: 560, marginInline: centre ? 'auto' : undefined }}>{sousTitre}</p>}
        {children}
      </div>
    </header>
  );
}

export default EntetePage;
