import { useState, useRef, useEffect } from 'react';

function AudioPlayer({ texte }) {
  const [lecture, setLecture] = useState(false);
  const [termine, setTermine] = useState(false);
  const [progression, setProgression] = useState(0);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const lire = () => {
    if (lecture) {
      window.speechSynthesis.cancel();
      setLecture(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voix = window.speechSynthesis.getVoices();
    const voixFR = voix.find(v => v.lang.startsWith('fr'));
    if (voixFR) utterance.voice = voixFR;

    utterance.onstart = () => { setLecture(true); setTermine(false); setProgression(0); };
    utterance.onend = () => { setLecture(false); setTermine(true); setProgression(100); };
    utterance.onerror = () => { setLecture(false); };
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const pct = Math.round((e.charIndex / texte.length) * 100);
        setProgression(pct);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const rejouer = () => {
    setTermine(false);
    setProgression(0);
    lire();
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a3a4a, #203a43)',
      borderRadius: '14px', padding: '20px',
      marginBottom: '20px', color: '#fff'
    }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        🎧 Compréhension Orale — Écoutez l'enregistrement
      </div>

      {/* Barre de progression */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progression}%`,
          background: '#1D9E75', borderRadius: '4px',
          transition: 'width 0.3s'
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={termine ? rejouer : lire}
          style={{
            width: '48px', height: '48px',
            background: lecture ? '#E24B4A' : '#1D9E75',
            border: 'none', borderRadius: '50%',
            cursor: 'pointer', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 15px ${lecture ? 'rgba(226,75,74,0.4)' : 'rgba(29,158,117,0.4)'}`,
            transition: 'all 0.2s'
          }}
        >
          {termine ? '🔁' : lecture ? '⏹' : '▶️'}
        </button>

        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {termine ? 'Terminé — Réécoutez si nécessaire' : lecture ? 'Lecture en cours...' : 'Appuyez pour écouter'}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            {lecture ? '🔴 En cours' : termine ? '✅ Terminé' : '⚪ Prêt'}
          </div>
        </div>

        {lecture && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: '3px',
                height: `${8 + Math.random() * 16}px`,
                background: '#1D9E75',
                borderRadius: '3px',
                animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`
              }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.5); opacity: 0.5; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AudioPlayer;