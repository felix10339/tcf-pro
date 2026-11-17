import Icone from './Icone';
import { scoreVersNCLC, libelleNCLC } from '../data/tcfCanada';

// Affichage complet d'une correction IA (expression écrite ou orale).
function CarteCorrection({ correction, section }) {
  const noteMax = Number(correction.note_max) || 20;
  const note20 = Math.round((Number(correction.note) / noteMax) * 20);
  const nclc = scoreVersNCLC(section, note20);
  const couleur = nclc >= 7 ? 'var(--succes)' : nclc >= 5 ? 'var(--alerte)' : 'var(--erreur)';

  return (
    <div className="pile gap-3">
      {/* Note */}
      <div className="carte ligne envelopper gap-4" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <div className="etiquette" style={{ marginBottom: 4 }}>Note</div>
          <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: couleur }}>
            {correction.note}<span className="texte-3" style={{ fontSize: '1.4rem' }}>/{noteMax}</span>
          </div>
        </div>
        <div>
          <div className="etiquette" style={{ marginBottom: 8 }}>Équivalence</div>
          <span className={`badge ${nclc >= 7 ? 'badge-succes' : 'badge-alerte'}`} style={{ fontSize: '0.95rem', padding: '6px 14px' }}>{libelleNCLC(nclc)}</span>
        </div>
        {correction.niveau_estime && (
          <div>
            <div className="etiquette" style={{ marginBottom: 8 }}>Niveau estimé</div>
            <span className="badge badge-action" style={{ fontSize: '0.95rem', padding: '6px 14px' }}>{correction.niveau_estime}</span>
          </div>
        )}
      </div>

      {/* Critères (oral) */}
      {Array.isArray(correction.criteres) && correction.criteres.length > 0 && (
        <div className="carte">
          <h3 className="titre-3" style={{ marginBottom: 14 }}>Détail par critère</h3>
          <div className="pile gap-3">
            {correction.criteres.map(c => (
              <div key={c.nom}>
                <div className="ligne entre petit" style={{ marginBottom: 6 }}>
                  <span className="gras">{c.nom}</span>
                  <span className="chiffres gras">{c.note}/{c.max}</span>
                </div>
                <div className="progression" style={{ marginBottom: 6 }}><div style={{ width: `${(c.note / c.max) * 100}%`, background: 'var(--nuit)' }} /></div>
                {c.commentaire && <p className="petit texte-2">{c.commentaire}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points forts / à améliorer */}
      <div className="grille grille-2">
        {[['Points forts', correction.points_forts, 'var(--succes)', 'coche'], ['À améliorer', correction.points_ameliorer, 'var(--alerte)', 'cible']].map(([titre, liste, coul, icone]) =>
          Array.isArray(liste) && liste.length > 0 && (
            <div key={titre} className="carte" style={{ borderTop: `3px solid ${coul}` }}>
              <h3 className="titre-3 ligne gap-1" style={{ marginBottom: 10, color: coul }}><Icone nom={icone} taille={18} /> {titre}</h3>
              <ul className="pile gap-1" style={{ paddingLeft: 18 }}>
                {liste.map((p, i) => <li key={i} className="texte-2">{p}</li>)}
              </ul>
            </div>
          ))}
      </div>

      {/* Erreurs */}
      {Array.isArray(correction.erreurs) && correction.erreurs.length > 0 && (
        <div className="carte">
          <h3 className="titre-3" style={{ marginBottom: 12 }}>Erreurs relevées</h3>
          <div className="pile gap-2">
            {correction.erreurs.map((e, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)', borderLeft: '3px solid var(--erreur)' }}>
                {e.type && <div className="etiquette" style={{ color: 'var(--erreur)', marginBottom: 4 }}>{e.type}</div>}
                <div style={{ textDecoration: 'line-through', color: 'var(--texte-3)' }}>{e.texte}</div>
                <div className="gras" style={{ color: 'var(--succes)' }}>→ {e.correction}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conseil */}
      {correction.conseils && (
        <div className="encadre encadre-info">
          <Icone nom="etincelle" taille={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--action)' }} />
          <div><p className="gras" style={{ marginBottom: 4 }}>Conseil de votre correcteur IA</p><p>{correction.conseils}</p></div>
        </div>
      )}

      {/* Version corrigée (écrit) */}
      {correction.version_corrigee && (
        <div className="carte">
          <h3 className="titre-3" style={{ marginBottom: 10 }}>Version améliorée suggérée</h3>
          <p className="texte-2" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{correction.version_corrigee}</p>
        </div>
      )}
    </div>
  );
}

export default CarteCorrection;
