import { useState, useEffect } from 'react';

function Dashboard({ utilisateur, onCommencerQuiz, onSimulateur, onTarifs }) {
  const [stats, setStats] = useState({
    totalQuestions: 0, bonnesReponses: 0, mauvaisesReponses: 0,
    sections: {
      'comprehension-ecrite': { total: 0, bonnes: 0 },
      'comprehension-orale': { total: 0, bonnes: 0 },
      'expression-ecrite': { total: 0, bonnes: 0 },
      'expression-orale': { total: 0, bonnes: 0 }
    }
  });

  useEffect(() => {
    const savedStats = localStorage.getItem(`stats-${utilisateur.id}`);
    if (savedStats) setStats(JSON.parse(savedStats));
  }, [utilisateur.id]);

  const estPro = utilisateur?.abonnement === 'pro';
  const tauxReussite = stats.totalQuestions > 0 ? Math.round((stats.bonnesReponses / stats.totalQuestions) * 100) : 0;
  const niveau = tauxReussite >= 80 ? 'C1' : tauxReussite >= 60 ? 'B2' : tauxReussite >= 40 ? 'B1' : 'A2';
  const recommandation = tauxReussite >= 80
    ? 'Excellent ! Vous approchez du niveau C1. Concentrez-vous sur les expressions.'
    : tauxReussite >= 60
    ? 'Bon progrès ! Pratiquez les sections où votre score est le plus bas.'
    : 'Continuez vos efforts ! Pratiquez 15 minutes par jour pour progresser.';

  const sections = [
    { key: 'comprehension-ecrite', label: 'Compréhension écrite', emoji: '📖', couleur: '#378ADD', bg: '#E6F1FB', gratuit: true },
    { key: 'comprehension-orale', label: 'Compréhension orale', emoji: '🎧', couleur: '#1D9E75', bg: '#E1F5EE', gratuit: true },
    { key: 'expression-ecrite', label: 'Expression écrite', emoji: '✍️', couleur: '#EF9F27', bg: '#FAEEDA', gratuit: false },
    { key: 'expression-orale', label: 'Expression orale', emoji: '🎤', couleur: '#D4537E', bg: '#FBEAF0', gratuit: false }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '28px 32px 60px', color: '#fff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>Bonjour, {utilisateur.nom} 👋</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            {estPro ? '✅ Compte Pro — Toutes les fonctionnalités sont débloquées' : 'Compte gratuit — Compréhension écrite et orale disponibles'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { val: niveau, label: 'Niveau estimé', couleur: '#1D9E75' },
            { val: `${tauxReussite}%`, label: 'Taux de réussite', couleur: '#378ADD' },
            { val: stats.totalQuestions, label: 'Questions répondues', couleur: '#EF9F27' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '18px 16px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: s.couleur }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recommandation — Pro seulement */}
        {estPro && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: '4px solid #1D9E75' }}>
            <p style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Recommandation IA</p>
            <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6' }}>{recommandation}</p>
          </div>
        )}

        {/* Banner upgrade si gratuit */}
        {!estPro && (
          <div onClick={onTarifs} style={{ background: 'linear-gradient(135deg, #0f2027, #1a3a4a)', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', cursor: 'pointer', border: '1px solid rgba(29,158,117,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>⭐ Passez à la version Pro</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>Débloquez le simulateur, les expressions et les corrections IA</div>
            </div>
            <div style={{ background: '#1D9E75', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '8px 16px', borderRadius: '8px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
              Voir les plans →
            </div>
          </div>
        )}

        {/* Simulateur — Pro uniquement */}
        {estPro && (
          <div onClick={onSimulateur} style={{ background: 'linear-gradient(135deg, #1a3a4a, #203a43)', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', cursor: 'pointer', border: '1px solid rgba(29,158,117,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '32px' }}>🎯</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Simulateur d'examen complet</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>4 épreuves — Conditions réelles — Score NCLC estimé</div>
              </div>
            </div>
            <div style={{ color: '#1D9E75', fontSize: '20px', fontWeight: '700' }}>→</div>
          </div>
        )}

        {/* Sections */}
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', color: '#1a1a2e' }}>S'exercer par compétence</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {sections.map(section => {
            const s = stats.sections[section.key];
            const taux = s.total > 0 ? Math.round((s.bonnes / s.total) * 100) : 0;
            const accessible = section.gratuit || estPro;
            return (
              <div key={section.key} onClick={() => onCommencerQuiz(section.key)}
                style={{ background: '#fff', borderRadius: '14px', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `2px solid ${accessible ? 'transparent' : '#f0f0f0'}`, transition: 'all 0.2s ease', opacity: accessible ? 1 : 0.75, position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { if (accessible) { e.currentTarget.style.borderColor = section.couleur; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = accessible ? 'transparent' : '#f0f0f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {!accessible && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#EF9F27', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' }}>
                    🔒 Pro
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', background: section.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{section.emoji}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{section.label}</div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>{accessible ? `${s.total} question${s.total > 1 ? 's' : ''} faites` : 'Réservé aux membres Pro'}</div>
                  </div>
                </div>
                <div style={{ height: '5px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ height: '100%', width: `${taux}%`, background: section.couleur, borderRadius: '5px', transition: 'width 0.6s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa' }}>
                  <span>{accessible ? `${taux}% réussi` : 'Passez Pro pour débloquer'}</span>
                  <span style={{ color: section.couleur, fontWeight: '600' }}>{accessible ? 'Commencer →' : '⭐ Pro'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;