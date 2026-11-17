import { useState, useRef, useEffect } from 'react';
import Icone from './Icone';

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
    utterance.lang = 'fr-CA';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voix = window.speechSynthesis.getVoices();
    // Voix canadienne en priorité, sinon n'importe quelle voix française
    const voixFR = voix.find(v => v.lang === 'fr-CA') || voix.find(v => v.lang.startsWith('fr'));
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
    <div style={{ background: 'var(--nuit)', borderRadius: 'var(--rayon)', padding: 18, marginBottom: 16, color: '#fff' }}>
      <div className="ligne gap-3">
        <button onClick={termine ? rejouer : lire} aria-label={termine ? 'Réécouter' : lecture ? 'Arrêter' : 'Écouter'}
          style={{ width: 48, height: 48, flexShrink: 0, borderRadius: '50%', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: lecture ? '#fff' : 'var(--action)', color: lecture ? 'var(--nuit)' : '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}>
          {lecture
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            : termine
              ? <Icone nom="retour" taille={18} />
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginLeft: 3 }}><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" /></svg>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ligne entre gap-2" style={{ marginBottom: 8 }}>
            <span className="petit gras">{termine ? 'Écoute terminée' : lecture ? 'Lecture en cours…' : 'Écoutez l\'enregistrement'}</span>
            <span className="tres-petit" style={{ opacity: 0.6 }}>{termine ? 'Vous pouvez réécouter' : lecture ? 'En cours' : 'Prêt'}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progression}%`, background: '#fff', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;