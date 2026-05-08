import { useState, useEffect } from 'react';

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

  const minutes = Math.floor(temps / 60);
  const secondes = temps % 60;
  const affichage = `${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}`;

  return (
    <div style={{ fontSize: '22px', fontWeight: 'bold', color: temps < 30 ? 'red' : '#1D9E75' }}>
      ⏱ {affichage}
    </div>
  );
}

export default Timer;