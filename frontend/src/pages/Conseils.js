import { useState } from 'react';
import EntetePage from '../components/EntetePage';
import Icone from '../components/Icone';
import { STRATEGIES, STRUCTURES, EXPRESSIONS, VOCABULAIRE_CANADIEN, OBJECTIFS_NCLC } from '../data/conseils';

const ONGLETS = [
  { key: 'generale', label: 'Stratégie' },
  { key: 'comprehension-orale', label: 'Compréhension orale' },
  { key: 'comprehension-ecrite', label: 'Compréhension écrite' },
  { key: 'expression-ecrite', label: 'Expression écrite' },
  { key: 'expression-orale', label: 'Expression orale' },
  { key: 'outils', label: 'Boîte à outils' },
  { key: 'nclc', label: 'Objectifs NCLC' }
];
const COULEUR = { 'comprehension-orale': 'var(--co)', 'comprehension-ecrite': 'var(--ce)', 'expression-ecrite': 'var(--ee)', 'expression-orale': 'var(--eo)', generale: 'var(--action)' };

function Structure({ structure }) {
  return (
    <div className="carte">
      <h3 className="titre-3" style={{ marginBottom: 12 }}>{structure.titre}</h3>
      <ol className="pile gap-2" style={{ listStyle: 'none', counterReset: 'etape' }}>
        {structure.etapes.map((e, i) => (
          <li key={i} className="ligne gap-2" style={{ alignItems: 'flex-start' }}>
            <span className="chiffres gras" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', background: 'var(--nuit)', color: '#fff' }}>{i + 1}</span>
            <span className="texte-2">{e}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Conseils({ onRetour, libelleRetour, ongletInitial = 'generale', onCommencer }) {
  const [onglet, setOnglet] = useState(ongletInitial);
  const strategie = STRATEGIES[onglet];
  const structures = onglet === 'expression-ecrite' ? STRUCTURES.ecrit : onglet === 'expression-orale' ? STRUCTURES.oral : null;

  return (
    <div>
      <EntetePage surTitre="Guide de méthode" titre="Conseils pour réussir le TCF Canada" sousTitre="Stratégies par épreuve, structures types, expressions utiles et objectifs NCLC selon votre projet." onRetour={onRetour} libelleRetour={libelleRetour} />

      <main className="conteneur chevauche" style={{ maxWidth: 900, paddingBottom: 56 }}>
        <div className="carte" style={{ padding: '0 12px', marginBottom: 20 }}>
          <nav className="onglets" style={{ borderBottom: 'none' }} role="tablist" aria-label="Rubriques du guide">
            {ONGLETS.map(o => (
              <button key={o.key} role="tab" aria-selected={onglet === o.key} className={`onglet${onglet === o.key ? ' actif' : ''}`} onClick={() => setOnglet(o.key)}>{o.label}</button>
            ))}
          </nav>
        </div>

        {/* ——— Stratégies par épreuve ——— */}
        {strategie && (
          <div className="pile gap-3 apparaitre" key={onglet}>
            <div className="encadre encadre-info carte" style={{ border: 'none' }}>
              <span style={{ color: COULEUR[onglet], display: 'inline-flex', flexShrink: 0, marginTop: 2 }}><Icone nom={strategie.icone} taille={20} /></span>
              <div>
                <h2 className="titre-2" style={{ marginBottom: 4 }}>{strategie.titre}</h2>
                <p>{strategie.intro}</p>
              </div>
            </div>

            {strategie.sections.map(s => (
              <section key={s.titre} className="carte">
                <h3 className="titre-3" style={{ marginBottom: 12 }}>{s.titre}</h3>
                <ul className="pile gap-2" style={{ listStyle: 'none' }}>
                  {s.points.map((p, i) => (
                    <li key={i} className="ligne gap-2" style={{ alignItems: 'flex-start' }}>
                      <Icone nom="coche" taille={16} style={{ flexShrink: 0, marginTop: 4, color: COULEUR[onglet] }} />
                      <span className="texte-2" style={{ lineHeight: 1.65 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {structures && (
              <>
                <h2 className="titre-2" style={{ marginTop: 8 }}>Structures types</h2>
                <div className="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
                  {Object.values(structures).map(st => <Structure key={st.titre} structure={st} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* ——— Boîte à outils ——— */}
        {onglet === 'outils' && (
          <div className="pile gap-3 apparaitre">
            {EXPRESSIONS.map(bloc => (
              <section key={bloc.titre} className="carte">
                <h2 className="titre-3" style={{ marginBottom: 14 }}>{bloc.titre}</h2>
                <div className="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
                  {bloc.groupes.map(g => (
                    <div key={g.sous}>
                      <p className="etiquette" style={{ marginBottom: 8 }}>{g.sous}</p>
                      <ul className="pile gap-1" style={{ listStyle: 'none' }}>
                        {g.items.map(it => <li key={it} className="petit" style={{ padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section className="carte">
              <h2 className="titre-3" style={{ marginBottom: 4 }}>Vocabulaire de la vie au Canada</h2>
              <p className="petit texte-3" style={{ marginBottom: 14 }}>Des mots fréquents dans les documents du TCF Canada, qui peuvent surprendre si vous avez appris le français ailleurs.</p>
              <div className="grille grille-2" style={{ gap: 8 }}>
                {VOCABULAIRE_CANADIEN.map(([mot, sens]) => (
                  <div key={mot} className="ligne gap-2 petit" style={{ padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)', alignItems: 'baseline' }}>
                    <strong style={{ whiteSpace: 'nowrap' }}>{mot}</strong><span className="texte-2">{sens}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ——— Objectifs NCLC ——— */}
        {onglet === 'nclc' && (
          <div className="pile gap-3 apparaitre">
            <div className="encadre encadre-info carte" style={{ border: 'none' }}>
              <Icone nom="cible" taille={20} style={{ flexShrink: 0, marginTop: 2, color: 'var(--action)' }} />
              <div>
                <h2 className="titre-2" style={{ marginBottom: 4 }}>Quel NCLC viser ?</h2>
                <p>Le score à atteindre dépend de votre projet. IRCC évalue chaque compétence séparément : il faut atteindre le minimum dans <strong>chacune</strong>.</p>
              </div>
            </div>
            <div className="carte" style={{ padding: 0 }}>
              {OBJECTIFS_NCLC.map((o, i) => (
                <div key={o.programme} className="ligne gap-3 envelopper" style={{ padding: '16px 20px', borderTop: i ? '1px solid var(--bordure)' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 260px' }}>
                    <div className="gras">{o.programme}</div>
                    <div className="petit texte-3">{o.detail}</div>
                  </div>
                  <span className="badge badge-action" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>{o.exigence}</span>
                </div>
              ))}
            </div>
            <div className="encadre encadre-alerte">
              <Icone nom="ampoule" taille={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <p>Ces exigences sont données à titre indicatif et peuvent changer. Vérifiez toujours les conditions à jour de votre programme sur <strong>canada.ca</strong> avant de vous inscrire à l'examen. Les résultats du TCF Canada sont acceptés par IRCC pendant 2 ans.</p>
            </div>
          </div>
        )}

        {/* Visiteur sans compte : invitation à passer à la pratique */}
        {onCommencer && (
          <div className="carte carte-nuit ligne entre envelopper gap-3" style={{ marginTop: 28, padding: 'clamp(20px, 3vw, 28px)' }}>
            <div>
              <h2 className="titre-2" style={{ color: '#fff', marginBottom: 4 }}>Mettez ces conseils en pratique</h2>
              <p className="petit" style={{ opacity: 0.75 }}>Entraînez-vous gratuitement sur des questions au format du TCF Canada.</p>
            </div>
            <button className="btn btn-primaire" onClick={onCommencer}>Créer mon compte gratuit <Icone nom="fleche" taille={16} /></button>
          </div>
        )}

        <p className="tres-petit texte-3 centre" style={{ marginTop: 24 }}>Conseils pédagogiques indépendants. TCF Pro n'est pas affilié à France Éducation international ni à IRCC.</p>
      </main>
    </div>
  );
}

export default Conseils;
