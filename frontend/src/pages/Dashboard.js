import { useState, useEffect } from 'react';
import Icone from '../components/Icone';
import { astuceDuJour } from '../data/conseils';

const SECTIONS = [
  { key: 'comprehension-orale', label: 'Compréhension orale', icone: 'casque', couleur: 'var(--co)', detail: 'Messages, annonces, entrevues', gratuit: true },
  { key: 'comprehension-ecrite', label: 'Compréhension écrite', icone: 'livre', couleur: 'var(--ce)', detail: 'Annonces, courriels, articles', gratuit: true },
  { key: 'expression-ecrite', label: 'Expression écrite', icone: 'stylo', couleur: 'var(--ee)', detail: '3 tâches, corrigées par l\'IA', gratuit: false },
  { key: 'expression-orale', label: 'Expression orale', icone: 'micro', couleur: 'var(--eo)', detail: '3 tâches, corrigées par l\'IA', gratuit: false }
];

const STATS_VIDES = {
  totalQuestions: 0, bonnesReponses: 0, mauvaisesReponses: 0,
  sections: {
    'comprehension-ecrite': { total: 0, bonnes: 0 },
    'comprehension-orale': { total: 0, bonnes: 0 },
    'expression-ecrite': { total: 0, bonnes: 0 },
    'expression-orale': { total: 0, bonnes: 0 }
  }
};

function Dashboard({ utilisateur, onCommencerQuiz, onSimulateur, onTarifs, onConseils }) {
  const astuce = astuceDuJour();
  const [stats, setStats] = useState(STATS_VIDES);

  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem(`stats-${utilisateur.id}`);
      if (sauvegarde) setStats({ ...STATS_VIDES, ...JSON.parse(sauvegarde) });
    } catch { /* statistiques illisibles : on repart de zéro */ }
  }, [utilisateur.id]);

  const estPro = utilisateur?.abonnement === 'pro';
  const prenom = utilisateur.nom?.split(' ')[0] || '';
  const taux = stats.totalQuestions > 0 ? Math.round((stats.bonnesReponses / stats.totalQuestions) * 100) : 0;
  const niveau = stats.totalQuestions === 0 ? '—' : taux >= 80 ? 'C1' : taux >= 60 ? 'B2' : taux >= 40 ? 'B1' : 'A2';
  const conseil = stats.totalQuestions === 0
    ? 'Commencez par un examen blanc pour connaître votre NCLC de départ.'
    : taux >= 80 ? 'Excellent travail ! Passez un examen blanc complet pour confirmer votre NCLC.'
    : taux >= 60 ? 'Bon progrès. Concentrez-vous sur votre compétence la plus faible.'
    : 'Continuez : 15 minutes par jour suffisent pour progresser rapidement.';

  return (
    <div>
      <header className="entete-page">
        <div className="conteneur" style={{ position: 'relative', zIndex: 1 }}>
          <p className="petit" style={{ opacity: 0.65, marginBottom: 4 }}>{estPro ? 'Membre Pro · tout est débloqué' : 'Compte gratuit'}</p>
          <h1 className="titre-1">Bonjour, {prenom} 👋</h1>
        </div>
      </header>

      <main className="conteneur chevauche" style={{ paddingBottom: 56 }}>
        {/* Statistiques */}
        <div className="grille grille-3" style={{ marginBottom: 20 }}>
          {[
            { val: niveau, label: 'Niveau indicatif', icone: 'graphique' },
            { val: `${taux} %`, label: 'Taux de réussite', icone: 'cible' },
            { val: stats.totalQuestions, label: 'Questions répondues', icone: 'coche' }
          ].map(s => (
            <div key={s.label} className="carte ligne gap-2" style={{ padding: 20 }}>
              <span className="pastille-icone" style={{ background: 'var(--surface-2)', color: 'var(--nuit)' }}><Icone nom={s.icone} /></span>
              <div>
                <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.1 }}>{s.val}</div>
                <div className="petit texte-3">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Examen blanc */}
        <button className="carte carte-cliquable carte-nuit ligne entre gap-3 envelopper" onClick={estPro ? onSimulateur : onTarifs}
          style={{ padding: 'clamp(20px, 3vw, 28px)', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div className="ligne gap-3" style={{ position: 'relative', zIndex: 1 }}>
            <span className="pastille-icone" style={{ width: 52, height: 52, background: 'var(--action)', color: '#fff' }}><Icone nom="cible" taille={26} /></span>
            <div>
              <div className="ligne gap-2" style={{ marginBottom: 2 }}>
                <span className="titre-3" style={{ color: '#fff' }}>Examen blanc TCF Canada</span>
                {!estPro && <span className="badge" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}><Icone nom="cadenas" taille={11} /> Pro</span>}
              </div>
              <div className="petit" style={{ color: 'rgba(255,255,255,0.7)' }}>4 épreuves au format officiel · résultat converti en NCLC</div>
            </div>
          </div>
          <span className="btn btn-primaire btn-petit" style={{ position: 'relative', zIndex: 1 }}>
            {estPro ? 'Commencer' : 'Débloquer'} <Icone nom="fleche" taille={16} />
          </span>
        </button>

        {/* Progression + astuce du jour */}
        <div className="grille grille-2" style={{ marginBottom: 32 }}>
          <div className="carte ligne gap-2" style={{ padding: '16px 18px', borderLeft: '3px solid var(--succes)', alignItems: 'flex-start' }}>
            <Icone nom="graphique" taille={18} style={{ color: 'var(--succes)', flexShrink: 0, marginTop: 3 }} />
            <div>
              <p className="etiquette" style={{ marginBottom: 4 }}>Votre progression</p>
              <p className="petit texte-2">{conseil}</p>
            </div>
          </div>
          <div className="carte ligne gap-2" style={{ padding: '16px 18px', borderLeft: '3px solid var(--action)', alignItems: 'flex-start' }}>
            <Icone nom="ampoule" taille={18} style={{ color: 'var(--action)', flexShrink: 0, marginTop: 3 }} />
            <div style={{ flex: 1 }}>
              <p className="etiquette" style={{ marginBottom: 4 }}>Astuce du jour · {astuce.epreuve}</p>
              <p className="petit texte-2" style={{ marginBottom: 8 }}>{astuce.texte}</p>
              <button className="btn-lien petit gras ligne gap-1" style={{ background: 'none', border: 'none', padding: 0, color: 'var(--action)' }} onClick={() => onConseils?.()}>
                Voir tous les conseils <Icone nom="fleche" taille={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Entraînement par compétence */}
        <h2 className="titre-2" style={{ marginBottom: 16 }}>S'entraîner par compétence</h2>
        <div className="grille grille-2">
          {SECTIONS.map(section => {
            const s = stats.sections?.[section.key] || { total: 0, bonnes: 0 };
            const reussite = s.total > 0 ? Math.round((s.bonnes / s.total) * 100) : 0;
            const accessible = section.gratuit || estPro;
            return (
              <button key={section.key} className="carte carte-cliquable" onClick={() => onCommencerQuiz(section.key)} style={{ padding: 20 }}>
                <div className="ligne entre" style={{ marginBottom: 16 }}>
                  <div className="ligne gap-2">
                    <span className="pastille-icone" style={{ background: 'var(--surface-2)', color: section.couleur }}><Icone nom={section.icone} /></span>
                    <div>
                      <div className="titre-3">{section.label}</div>
                      <div className="petit texte-3">{section.detail}</div>
                    </div>
                  </div>
                  {!accessible && <span className="badge badge-alerte"><Icone nom="cadenas" taille={11} /> Pro</span>}
                </div>
                <div className="progression" style={{ marginBottom: 8 }}>
                  <div style={{ width: `${reussite}%`, background: section.couleur }} />
                </div>
                <div className="ligne entre petit">
                  <span className="texte-3">{accessible ? (s.total ? `${reussite} % de réussite · ${s.total} question${s.total > 1 ? 's' : ''}` : 'Pas encore commencé') : 'Réservé aux membres Pro'}</span>
                  <span className="ligne gap-1 gras" style={{ color: section.couleur }}>{accessible ? 'S\'entraîner' : 'Débloquer'} <Icone nom="fleche" taille={14} /></span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
