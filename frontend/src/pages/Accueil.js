import { useState } from 'react';
import Logo from '../components/Logo';
import Icone from '../components/Icone';
import { EPREUVES } from '../data/tcfCanada';
import DemoSimulateur from '../components/DemoSimulateur';

const ICONE_EPREUVE = { 'comprehension-orale': 'casque', 'comprehension-ecrite': 'livre', 'expression-ecrite': 'stylo', 'expression-orale': 'micro' };
const COULEUR_EPREUVE = { 'comprehension-orale': 'var(--co)', 'comprehension-ecrite': 'var(--ce)', 'expression-ecrite': 'var(--ee)', 'expression-orale': 'var(--eo)' };

// Exemple illustratif affiché dans le visuel du hero (pas un vrai résultat)
const EXEMPLE_RESULTAT = [
  { label: 'Compréhension orale', score: '512', max: '699', nclc: 8, pct: 73 },
  { label: 'Compréhension écrite', score: '468', max: '699', nclc: 7, pct: 67 },
  { label: 'Expression écrite', score: '12', max: '20', nclc: 8, pct: 60 },
  { label: 'Expression orale', score: '10', max: '20', nclc: 7, pct: 50 }
];

const ETAPES = [
  { titre: 'Évaluez votre niveau', texte: 'Passez un examen blanc au format officiel : 4 épreuves chronométrées, de A1 à C2.' },
  { titre: 'Obtenez votre NCLC', texte: 'Chaque épreuve est convertie en NCLC selon les équivalences d\'IRCC, avec les points qu\'il vous manque.' },
  { titre: 'Progressez là où ça compte', texte: 'Entraînez-vous par compétence et faites corriger vos productions par l\'IA, avec une note sur 20.' }
];

// Aperçu du guide sur la page d'accueil
const APERCU_CONSEILS = [
  { rubrique: 'comprehension-orale', icone: 'casque', titre: 'Compréhension orale', texte: 'Méfiez-vous des réponses qui reprennent mot pour mot l\'enregistrement : ce sont souvent des pièges.' },
  { rubrique: 'expression-ecrite', icone: 'stylo', titre: 'Expression écrite', texte: 'En tâche 3, présentez les deux documents avant de donner votre opinion : c\'est ce que le correcteur attend.' },
  { rubrique: 'nclc', icone: 'cible', titre: 'Objectif NCLC', texte: 'IRCC évalue chaque compétence séparément : votre compétence la plus faible décide de votre admissibilité.' }
];

function Accueil({ onCommencer, onConseils }) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  const allerA = id => { setMenuOuvert(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div>
      {/* ——— Navigation ——— */}
      <nav className="nav">
        <div className="conteneur nav-interieur">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <div className="nav-liens desktop-only">
            <button className="nav-lien" onClick={() => allerA('epreuves')}>Les épreuves</button>
            <button className="nav-lien" onClick={() => allerA('demo')}>Démo du simulateur</button>
            <button className="nav-lien" onClick={() => allerA('methode')}>Méthode</button>
            <button className="nav-lien" onClick={() => onConseils?.()}>Conseils</button>
          </div>
          <div className="ligne gap-2">
            <button className="btn btn-lien desktop-only" onClick={onCommencer}>Se connecter</button>
            <button className="btn btn-primaire btn-petit" onClick={onCommencer}>Commencer</button>
            <button className="btn btn-lien mobile-only" onClick={() => setMenuOuvert(o => !o)} aria-label="Menu" aria-expanded={menuOuvert}>
              <Icone nom={menuOuvert ? 'croix' : 'menu'} taille={22} />
            </button>
          </div>
        </div>
        {menuOuvert && (
          <div className="menu-mobile mobile-only">
            <button className="nav-lien" onClick={() => allerA('epreuves')}>Les épreuves</button>
            <button className="nav-lien" onClick={() => allerA('demo')}>Démo du simulateur</button>
            <button className="nav-lien" onClick={() => allerA('methode')}>Méthode</button>
            <button className="nav-lien" onClick={() => onConseils?.()}>Conseils</button>
            <button className="nav-lien" onClick={onCommencer}>Se connecter</button>
          </div>
        )}
      </nav>

      {/* ——— Hero ——— */}
      <header className="section" style={{ paddingTop: 'clamp(40px, 7vw, 88px)' }}>
        <div className="conteneur grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(32px, 6vw, 72px)', alignItems: 'center' }}>
          <div className="apparaitre">
            <div className="sur-titre" style={{ marginBottom: 18 }}>Préparation au TCF Canada</div>
            <h1 className="titre-display" style={{ marginBottom: 20 }}>
              Visez le <span style={{ color: 'var(--action)' }}>NCLC 7</span> au TCF Canada.
            </h1>
            <p className="texte-intro" style={{ marginBottom: 28, maxWidth: 520 }}>
              Des examens blancs au format officiel, des situations de la vie au Canada et un résultat converti en NCLC, le niveau qu'IRCC utilise pour Entrée express.
            </p>
            <div className="ligne envelopper gap-2" style={{ marginBottom: 28 }}>
              <button className="btn btn-primaire btn-grand" onClick={onCommencer}>
                Commencer gratuitement <Icone nom="fleche" taille={18} />
              </button>
              <button className="btn btn-contour btn-grand" onClick={() => allerA('demo')}>Essayer la démo</button>
            </div>
            <ul className="ligne envelopper gap-3 petit texte-2" style={{ listStyle: 'none' }}>
              {['Format officiel', 'Résultats en NCLC', 'Corrections par IA'].map(t => (
                <li key={t} className="ligne gap-1"><Icone nom="coche" taille={16} style={{ color: 'var(--succes)' }} />{t}</li>
              ))}
            </ul>
          </div>

          {/* Visuel : exemple de résultat */}
          <div className="apparaitre delai-2" aria-label="Exemple de résultat estimé">
            <div className="carte" style={{ padding: 0, boxShadow: 'var(--ombre-3)', overflow: 'hidden', maxWidth: 480, marginInline: 'auto' }}>
              <div className="ligne entre" style={{ padding: '18px 22px', borderBottom: '1px solid var(--bordure)' }}>
                <div>
                  <div className="tres-petit texte-3 gras" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Examen blanc · exemple</div>
                  <div className="titre-3">Résultat estimé</div>
                </div>
                <span className="badge badge-succes"><Icone nom="coche" taille={13} /> Objectif atteint</span>
              </div>
              <div className="pile gap-3" style={{ padding: '20px 22px' }}>
                {EXEMPLE_RESULTAT.map(r => (
                  <div key={r.label}>
                    <div className="ligne entre petit" style={{ marginBottom: 6 }}>
                      <span className="texte-2">{r.label}</span>
                      <span className="chiffres"><strong>{r.score}</strong><span className="texte-3">/{r.max}</span> · <strong style={{ color: 'var(--succes)' }}>NCLC {r.nclc}</strong></span>
                    </div>
                    <div className="progression"><div style={{ width: `${r.pct}%`, background: 'var(--nuit)' }} /></div>
                  </div>
                ))}
              </div>
              <div className="ligne entre" style={{ padding: '16px 22px', background: 'var(--nuit)', color: '#fff' }}>
                <span className="petit" style={{ opacity: 0.75 }}>Niveau le plus faible</span>
                <span style={{ fontFamily: 'var(--police-titre)', fontSize: '1.5rem', fontWeight: 700 }}>NCLC 7</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ——— Bandeau de faits ——— */}
      <section style={{ background: 'var(--nuit)', color: '#fff' }}>
        <div className="conteneur grille grille-4" style={{ padding: '32px 20px' }}>
          {[
            { val: '4', label: 'épreuves officielles' },
            { val: 'A1 → C2', label: 'questions de tous niveaux' },
            { val: 'NCLC 4 → 10+', label: 'conversion IRCC' },
            { val: '100 %', label: 'situations canadiennes' }
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontFamily: 'var(--police-titre)', fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)', fontWeight: 700 }}>{f.val}</div>
              <div className="petit" style={{ opacity: 0.7 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Les 4 épreuves ——— */}
      <section id="epreuves" className="section">
        <div className="conteneur">
          <div style={{ maxWidth: 640, marginBottom: 40 }}>
            <div className="sur-titre" style={{ marginBottom: 12 }}>Le format officiel</div>
            <h2 className="titre-1" style={{ marginBottom: 12 }}>Les 4 épreuves du TCF Canada, dans les vraies conditions</h2>
            <p className="texte-intro">Mêmes durées, même nombre de questions, même progression de difficulté que le jour de l'examen.</p>
          </div>
          <div className="grille grille-4">
            {EPREUVES.map(ep => (
              <article key={ep.key} className="carte">
                <div className="pastille-icone" style={{ background: 'var(--surface-2)', color: COULEUR_EPREUVE[ep.key], marginBottom: 16 }}>
                  <Icone nom={ICONE_EPREUVE[ep.key]} taille={22} />
                </div>
                <h3 className="titre-3" style={{ marginBottom: 6 }}>{ep.label}</h3>
                <p className="petit texte-2" style={{ marginBottom: 14 }}>
                  {ep.type === 'qcm' ? `${ep.nbQuestions} questions à choix multiples, de A1 à C2.` : `${ep.nbTaches} tâches, corrigées par l'IA.`}
                </p>
                <div className="ligne gap-1 envelopper">
                  <span className="badge"><Icone nom="chrono" taille={13} /> {ep.dureeMinutes} min</span>
                  <span className="badge">Noté {ep.bareme}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Démo du simulateur ——— */}
      <section id="demo" className="section" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--bordure)' }}>
        <div className="conteneur" style={{ maxWidth: 880 }}>
          <div className="centre" style={{ marginBottom: 32 }}>
            <div className="sur-titre" style={{ marginBottom: 12 }}>Démo du simulateur</div>
            <h2 className="titre-1" style={{ marginBottom: 8 }}>Essayez l'examen blanc, gratuitement</h2>
            <p className="texte-2">Un mini examen chronométré dans l'interface du vrai simulateur. Sans inscription.</p>
          </div>
          <DemoSimulateur onCommencer={onCommencer} />
        </div>
      </section>

      {/* ——— Aperçu des conseils ——— */}
      <section id="conseils" className="section">
        <div className="conteneur">
          <div className="ligne entre envelopper gap-3" style={{ marginBottom: 32, alignItems: 'flex-end' }}>
            <div style={{ maxWidth: 600 }}>
              <div className="sur-titre" style={{ marginBottom: 12 }}>Guide gratuit</div>
              <h2 className="titre-1" style={{ marginBottom: 8 }}>Les conseils qui font gagner des points</h2>
              <p className="texte-2">Méthode par épreuve, pièges fréquents, structures types et objectifs NCLC. Consultable sans inscription.</p>
            </div>
            <button className="btn btn-contour" onClick={() => onConseils?.()}>Lire le guide complet <Icone nom="fleche" taille={16} /></button>
          </div>
          <div className="grille grille-3">
            {APERCU_CONSEILS.map(c => (
              <button key={c.titre} className="carte carte-cliquable pile" style={{ gap: 10 }} onClick={() => onConseils?.(c.rubrique)}>
                <span className="ligne gap-2 gras" style={{ color: 'var(--action)' }}><Icone nom={c.icone} taille={18} /> {c.titre}</span>
                <p className="texte-2" style={{ lineHeight: 1.6 }}>{c.texte}</p>
                <span className="ligne gap-1 petit gras" style={{ color: 'var(--action)', marginTop: 'auto' }}>En savoir plus <Icone nom="fleche" taille={14} /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Méthode ——— */}
      <section id="methode" className="section">
        <div className="conteneur">
          <div className="centre" style={{ maxWidth: 620, margin: '0 auto 44px' }}>
            <div className="sur-titre" style={{ marginBottom: 12 }}>La méthode</div>
            <h2 className="titre-1">Trois étapes vers votre NCLC cible</h2>
          </div>
          <div className="grille grille-3">
            {ETAPES.map((e, i) => (
              <div key={e.titre} className="carte" style={{ position: 'relative' }}>
                <div style={{ fontFamily: 'var(--police-titre)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--action)', lineHeight: 1, marginBottom: 14 }}>{i + 1}</div>
                <h3 className="titre-3" style={{ marginBottom: 8 }}>{e.titre}</h3>
                <p className="petit texte-2">{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Fondateur ——— */}
      <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--bordure)' }}>
        <div className="conteneur-etroit ligne gap-4 envelopper" style={{ justifyContent: 'center' }}>
          <img src="/fondateur.webp" alt="Felix Chatue, fondateur et CEO de TCF Pro" width="192" height="256" loading="lazy" decoding="async"
            style={{ width: 192, height: 256, objectFit: 'cover', objectPosition: 'center top', borderRadius: 'var(--rayon-lg)', boxShadow: 'var(--ombre-2)', flexShrink: 0 }} />
          <figure style={{ flex: 1, minWidth: 260 }}>
            <blockquote className="titre-2" style={{ fontWeight: 600, marginBottom: 16 }}>
              « J'ai créé TCF Pro pour que chaque candidat francophone, peu importe son pays ou son budget, arrive au TCF Canada en sachant exactement où il en est. »
            </blockquote>
            <figcaption className="petit">
              <strong>Felix Chatue</strong> <span className="texte-3">· Fondateur et CEO de TCF Pro</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ——— Appel final ——— */}
      <section className="section" style={{ background: 'var(--nuit)', color: '#fff', textAlign: 'center' }}>
        <div className="conteneur-etroit">
          <h2 className="titre-1" style={{ marginBottom: 14 }}>Prêt à connaître votre NCLC ?</h2>
          <p style={{ opacity: 0.75, marginBottom: 28 }}>Créez votre compte gratuitement et commencez à vous entraîner dès aujourd'hui.</p>
          <button className="btn btn-primaire btn-grand" onClick={onCommencer}>Commencer gratuitement <Icone nom="fleche" taille={18} /></button>
        </div>
      </section>

      <footer style={{ background: '#081629', color: 'rgba(255,255,255,0.55)', padding: '28px 0' }}>
        <div className="conteneur ligne entre envelopper gap-2 petit">
          <Logo clair onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <span>© {new Date().getFullYear()} TCF Pro · Plateforme indépendante, non affiliée à France Éducation international ni à IRCC.</span>
        </div>
      </footer>
    </div>
  );
}

export default Accueil;
