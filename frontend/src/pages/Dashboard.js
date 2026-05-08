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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const savedStats = localStorage.getItem(`stats-${utilisateur.id}`);
    if (savedStats) setStats(JSON.parse(savedStats));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [utilisateur.id]);

  const estPro = utilisateur?.abonnement === 'pro';
  const tauxReussite = stats.totalQuestions > 0 ? Math.round((stats.bonnesReponses / stats.totalQuestions) * 100) : 0;
  const niveau = tauxReussite >= 80 ? 'C1' : tauxReussite >= 60 ? 'B2' : tauxReussite >= 40 ? 'B1' : 'A2';
  const recommandation = tauxReussite >= 80
    ? 'Excellent ! Vous approchez du niveau C1.'
    : tauxReussite >= 60
    ? 'Bon progrès ! Pratiquez les sections les plus faibles.'
    : 'Continuez ! 15 minutes par jour suffisent pour progresser.';

  const sections = [
    { key: 'comprehension-ecrite', label: 'Compréhension écrite', emoji: '📖', couleur: '#378ADD', bg: '#E6F1FB', gratuit: true },
    { key: 'comprehension-orale', label: 'Compréhension orale', emoji: '🎧', couleur: '#1D9E75', bg: '#E1F5EE', gratuit: true },
    { key: 'expression-ecrite', label: 'Expression écrite', emoji: '✍️', couleur: '#EF9F27', bg: '#FAEEDA', gratuit: false },
    { key: 'expression-orale', label: 'Expression orale', emoji: '🎤', couleur: '#D4537E', bg: '#FBEAF0', gratuit: false }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: isMobile ? '24px 16px 50px' : '28px 32px 60px', color: '#fff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', marginBottom: '4px' }}>
            Bonjour, {utilisateur.nom.split(' ')[0]} 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
            {estPro ? '✅ Compte Pro — Tout est débloqué' : 'Compte gratuit — Passez Pro pour tout débloquer'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: isMobile ? '-24px auto 0' : '-32px auto 0', padding: isMobile ? '0 12px 32px' : '0 20px 40px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? '8px' : '12px', marginBottom: isMobile ? '12px' : '20px' }}>
          {[
            { val: niveau, label: 'Niveau', couleur: '#1D9E75' },
            { val: `${tauxReussite}%`, label: 'Réussite', couleur: '#378ADD' },
            { val: stats.totalQuestions, label: 'Questions', couleur: '#EF9F27' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: isMobile ? '12px 8px' : '18px 16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: s.couleur }}>{s.val}</div>
              <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#999', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recommandation Pro */}
        {estPro && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '14px 16px', marginBottom: isMobile ? '12px' : '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #1D9E75' }}>
            <p style={{ fontSize: '11px', color: '#1D9E75', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Recommandation</p>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{recommandation}</p>
          </div>
        )}

        {/* Banner upgrade */}
        {!estPro && (
          <div onClick={onTarifs} style={{ background: 'linear-gradient(135deg, #0f2027, #1a3a4a)', borderRadius: '12px', padding: '14px 16px', marginBottom: isMobile ? '12px' : '16px', cursor: 'pointer', border: '1px solid rgba(29,158,117,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>⭐ Passez à la version Pro</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>Simulateur, expressions et corrections IA</div>
            </div>
            <div style={{ background: '#1D9E75', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Voir →
            </div>
          </div>
        )}

        {/* Simulateur Pro */}
        {estPro && (
          <div onClick={onSimulateur} style={{ background: 'linear-gradient(135deg, #1a3a4a, #203a43)', borderRadius: '12px', padding: isMobile ? '14px 16px' : '18px 20px', marginBottom: isMobile ? '12px' : '16px', cursor: 'pointer', border: '1px solid rgba(29,158,117,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: isMobile ? '24px' : '32px' }}>🎯</div>
              <div>
                <div style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>Simulateur d'examen complet</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>4 épreuves — Conditions réelles</div>
              </div>
            </div>
            <div style={{ color: '#1D9E75', fontSize: '18px', fontWeight: '700' }}>→</div>
          </div>
        )}

        {/* Sections */}
        <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', marginBottom: '12px', color: '#1a1a2e' }}>
          S'exercer par compétence
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '8px' : '12px' }}>
          {sections.map(section => {
            const s = stats.sections[section.key];
            const taux = s.total > 0 ? Math.round((s.bonnes / s.total) * 100) : 0;
            const accessible = section.gratuit || estPro;
            return (
              <div key={section.key} onClick={() => onCommencerQuiz(section.key)}
                style={{ background: '#fff', borderRadius: '12px', padding: isMobile ? '14px' : '18px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '2px solid transparent', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', opacity: accessible ? 1 : 0.8 }}
                onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.borderColor = section.couleur; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >
                {!accessible && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#EF9F27', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '8px' }}>
                    🔒 Pro
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: section.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {section.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.label}</div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>{accessible ? `${s.total} question${s.total > 1 ? 's' : ''} faites` : 'Réservé Pro'}</div>
                  </div>
                </div>
                <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', width: `${taux}%`, background: section.couleur, borderRadius: '4px', transition: 'width 0.6s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa' }}>
                  <span>{accessible ? `${taux}% réussi` : 'Passez Pro'}</span>
                  <span style={{ color: section.couleur, fontWeight: '600' }}>{accessible ? 'Commencer →' : '⭐'}</span>
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