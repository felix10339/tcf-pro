import { useState, useEffect } from 'react';
import Icone from './Icone';

// Image d'un document de question (affiche, horaire, reçu…), agrandissable au clic.
function ImageDocument({ src, alt }) {
  const [zoom, setZoom] = useState(false);

  // Échap ferme l'agrandissement
  useEffect(() => {
    if (!zoom) return;
    const fermer = e => { if (e.key === 'Escape') setZoom(false); };
    window.addEventListener('keydown', fermer);
    return () => window.removeEventListener('keydown', fermer);
  }, [zoom]);

  return (
    <>
      <button type="button" onClick={() => setZoom(true)} aria-label={`Agrandir l'image : ${alt}`}
        style={{ display: 'block', width: '100%', padding: 0, border: '1px solid var(--bordure)', borderRadius: 'var(--rayon-sm)', background: 'var(--surface-2)', cursor: 'zoom-in', position: 'relative', overflow: 'hidden' }}>
        <img src={src} alt={alt} loading="lazy" decoding="async"
          style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block' }} />
        <span className="badge" style={{ position: 'absolute', right: 10, bottom: 10, background: 'rgba(11,31,58,0.75)', color: '#fff' }}>
          Agrandir
        </span>
      </button>

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={alt} onClick={() => setZoom(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,16,30,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
          <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
          <button type="button" onClick={() => setZoom(false)} aria-label="Fermer"
            style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icone nom="croix" taille={20} />
          </button>
        </div>
      )}
    </>
  );
}

export default ImageDocument;
