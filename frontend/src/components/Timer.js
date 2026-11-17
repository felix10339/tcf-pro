import { useState, useEffect } from 'react';
import Icone from './Icone';

function Timer({ duree, onExpire }) {
  const [temps, setTemps] = useState(duree);

  useEffect(() => {
    if (temps <= 0) {
      onExpire();
      return;
    }
    const interval = setInterval(() => setTemps(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [temps, onExpire]);

  const affichage = `${String(Math.floor(temps / 60)).padStart(2, '0')}:${String(temps % 60).padStart(2, '0')}`;
  const urgent = temps < 30;

  return (
    <span className="badge chiffres" role="timer" aria-label={`Temps restant ${affichage}`}
      style={{ fontSize: '0.95rem', padding: '7px 12px', background: urgent ? 'var(--erable-pale)' : 'var(--surface)', color: urgent ? 'var(--erreur)' : 'var(--texte)', border: '1px solid var(--bordure)' }}>
      <Icone nom="chrono" taille={15} /> {affichage}
    </span>
  );
}

export default Timer;
