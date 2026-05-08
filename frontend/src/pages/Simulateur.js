import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from '../components/AudioPlayer';
import API_URL from '../config';

function Simulateur({ utilisateur, onRetour }) {
  const [phase, setPhase] = useState('intro');
  const [epreuve, setEpreuve] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [indexActuel, setIndexActuel] = useState(0);
  const [reponses, setReponses] = useState({});
  const [tempsRestant, setTempsRestant] = useState(0);
  const [resultat, setResultat] = useState(null);
  const [resultatsParEpreuve, setResultatsParEpreuve] = useState([]);

  // Expression écrite
  const [redaction, setRedaction] = useState('');
  const [sujetEE, setSujetEE] = useState(null);

  // Expression orale
  const [transcription, setTranscription] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [sujetEO, setSujetEO] = useState(null);
  const [tempsPrep, setTempsPrep] = useState(30);
  const [phaseOrale, setPhaseOrale] = useState('prep');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const EPREUVES = [
    { key: 'comprehension-ecrite', label: 'Compréhension écrite', emoji: '📖', dureeMinutes: 15, couleur: '#378ADD', type: 'qcm' },
    { key: 'comprehension-orale', label: 'Compréhension orale', emoji: '🎧', dureeMinutes: 10, couleur: '#1D9E75', type: 'qcm' },
    { key: 'expression-ecrite', label: 'Expression écrite', emoji: '✍️', dureeMinutes: 20, couleur: '#EF9F27', type: 'redaction' },
    { key: 'expression-orale', label: 'Expression orale', emoji: '🎤', dureeMinutes: 10, couleur: '#D4537E', type: 'oral' }
  ];

  const SUJETS_EE = [
    { tache: 'Tâche — Texte argumentatif', sujet: 'Les réseaux sociaux ont-ils plus d\'effets positifs que négatifs sur la société ? Donnez votre opinion en développant des arguments.', minMots: 160, maxMots: 180 },
    { tache: 'Tâche — Opinion', sujet: 'Pensez-vous que le télétravail est l\'avenir du monde professionnel ? Justifiez votre point de vue.', minMots: 150, maxMots: 180 }
  ];

  const SUJETS_EO = [
    { sujet: 'Donnez votre avis sur le sujet suivant : "Les jeunes d\'aujourd\'hui lisent-ils suffisamment ?" Développez votre point de vue en 2-3 minutes.', duree: 120 },
    { sujet: 'Parlez de l\'importance de l\'apprentissage des langues étrangères dans le monde actuel. Donnez des exemples tirés de votre expérience.', duree: 120 }
  ];

  useEffect(() => {
    setSujetEE(SUJETS_EE[Math.floor(Math.random() * SUJETS_EE.length)]);
    setSujetEO(SUJETS_EO[Math.floor(Math.random() * SUJETS_EO.length)]);
  }, []);

  useEffect(() => {
    if (phase === 'epreuve') {
      const ep = EPREUVES[epreuve];
      setTempsRestant(ep.dureeMinutes * 60);
      const interval = setInterval(() => {
        setTempsRestant(t => {
          if (t <= 1) { clearInterval(interval); passerEpreuvesSuivante(); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, epreuve]);

  const chargerQuestions = async (section) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/questions/section/${section}`);
    return res.data.slice(0, 5);
  };

  const commencerExamen = async () => {
    setPhase('chargement');
    const [ecrite, orale] = await Promise.all([
      chargerQuestions('comprehension-ecrite'),
      chargerQuestions('comprehension-orale')
    ]);
    setQuestions({ ecrite, orale });
    setEpreuve(0);
    setPhase('epreuve');
    setPhaseOrale('prep');
  };

  const passerEpreuvesSuivante = useCallback(() => {
    const ep = EPREUVES[epreuve];

    // Sauvegarder résultat epreuve actuelle
    if (ep.type === 'qcm') {
      const qs = epreuve === 0 ? questions.ecrite : questions.orale;
      let score = 0;
      qs?.forEach((q, i) => { if (reponses[`${epreuve}-${i}`] === q.correct) score++; });
      setResultatsParEpreuve(prev => [...prev, { label: ep.label, emoji: ep.emoji, couleur: ep.couleur, score, total: qs?.length || 0, type: 'qcm' }]);
    } else if (ep.type === 'redaction') {
      const nbMots = redaction.trim().split(/\s+/).filter(m => m.length > 0).length;
      setResultatsParEpreuve(prev => [...prev, { label: ep.label, emoji: ep.emoji, couleur: ep.couleur, nbMots, soumis: nbMots >= 50, type: 'redaction' }]);
    } else if (ep.type === 'oral') {
      const nbMots = transcription.trim().split(/\s+/).filter(m => m.length > 0).length;
      setResultatsParEpreuve(prev => [...prev, { label: ep.label, emoji: ep.emoji, couleur: ep.couleur, nbMots, soumis: nbMots >= 20, type: 'oral' }]);
    }

    if (epreuve + 1 >= EPREUVES.length) {
      setPhase('resultat');
    } else {
      setEpreuve(e => e + 1);
      setIndexActuel(0);
      setPhaseOrale('prep');
    }
  }, [epreuve, questions, reponses, redaction, transcription]);

  const demarrerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setEnregistrement(true);

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.lang = 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = true;
        let stable = '';
        recognition.onresult = e => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) stable += e.results[i][0].transcript + ' ';
            else interim += e.results[i][0].transcript;
          }
          setTranscription(stable + interim);
        };
        recognitionRef.current = recognition;
        recognition.start();
      }
      setPhaseOrale('enregistrement');
    } catch {
      alert('Impossible d\'accéder au microphone.');
    }
  };

  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (recognitionRef.current) recognitionRef.current.stop();
    setEnregistrement(false);
    setPhaseOrale('termine');
  };

  const formatTemps = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const compterMots = t => t.trim().split(/\s+/).filter(m => m.length > 0).length;

  const epActuelle = EPREUVES[epreuve];

  // INTRO
  if (phase === 'intro') return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '40px 32px 80px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Simulateur d'examen TCF</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>4 épreuves complètes — Conditions réelles</p>
      </div>
      <div style={{ maxWidth: '600px', margin: '-40px auto 0', padding: '0 20px 40px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Déroulement de l'examen</h3>
          {EPREUVES.map((ep, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < EPREUVES.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ width: '40px', height: '40px', background: '#f4f6f8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{ep.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{ep.label}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{ep.type === 'qcm' ? '5 questions QCM' : ep.type === 'redaction' ? 'Rédaction guidée' : 'Monologue enregistré'} — {ep.dureeMinutes} min</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: ep.couleur }}>{ep.dureeMinutes} min</div>
            </div>
          ))}
          <div style={{ marginTop: '16px', background: '#f9fafb', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Total</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1D9E75' }}>55 minutes</span>
          </div>
        </div>
        <button onClick={commencerExamen} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', boxShadow: '0 4px 15px rgba(29,158,117,0.35)' }}>
          Commencer l'examen →
        </button>
        <button onClick={onRetour} style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'transparent', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#666' }}>
          ← Retour
        </button>
      </div>
    </div>
  );

  if (phase === 'chargement') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '16px', color: '#666' }}>Chargement des questions...</p>
      </div>
    </div>
  );

  // ÉPREUVE EN COURS
  if (phase === 'epreuve') {
    const couleurTemps = tempsRestant < 120 ? '#E24B4A' : tempsRestant < 300 ? '#EF9F27' : '#1D9E75';

    const barreEpreuve = (
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #eee', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Épreuve {epreuve + 1}/{EPREUVES.length} — {epActuelle.emoji} {epActuelle.label}</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {EPREUVES.map((ep, i) => (
              <div key={i} style={{ width: '20px', height: '4px', borderRadius: '2px', background: i < epreuve ? '#1D9E75' : i === epreuve ? ep.couleur : '#eee' }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: couleurTemps }}>⏱ {formatTemps(tempsRestant)}</div>
        <button onClick={passerEpreuvesSuivante} style={{ padding: '8px 16px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          {epreuve + 1 >= EPREUVES.length ? 'Terminer ✓' : 'Épreuve suivante →'}
        </button>
      </div>
    );

    // QCM — Compréhension écrite / orale
    if (epActuelle.type === 'qcm') {
      const qs = epreuve === 0 ? questions.ecrite : questions.orale;
      if (!qs || qs.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
      const q = qs[indexActuel];
      const repActuelle = reponses[`${epreuve}-${indexActuel}`];

      return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
          {barreEpreuve}
          <div style={{ height: '3px', background: '#eee' }}>
            <div style={{ height: '100%', width: `${((indexActuel + 1) / qs.length) * 100}%`, background: epActuelle.couleur, transition: 'width 0.4s' }} />
          </div>
          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {qs.map((_, i) => (
                <button key={i} onClick={() => setIndexActuel(i)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: i === indexActuel ? `2px solid ${epActuelle.couleur}` : '1px solid #ddd', background: reponses[`${epreuve}-${i}`] !== undefined ? '#E1F5EE' : i === indexActuel ? '#f4f6f8' : '#fff', color: reponses[`${epreuve}-${i}`] !== undefined ? '#0F6E56' : '#666', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  {i + 1}
                </button>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
              {epActuelle.key === 'comprehension-orale' && q.audio_texte && (
                <AudioPlayer texte={q.audio_texte} />
              )}
              {epActuelle.key === 'comprehension-ecrite' && (
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>Texte</p>
                  <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#333' }}>{q.texte}</p>
                </div>
              )}
              <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>{q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => setReponses(prev => ({ ...prev, [`${epreuve}-${indexActuel}`]: i }))}
                    style={{ padding: '13px 16px', borderRadius: '10px', textAlign: 'left', border: repActuelle === i ? `2px solid ${epActuelle.couleur}` : '1.5px solid #e8e8e8', background: repActuelle === i ? epActuelle.couleur + '15' : '#fff', color: '#333', cursor: 'pointer', fontSize: '14px', fontWeight: repActuelle === i ? '600' : '400', transition: 'all 0.15s' }}>
                    <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', background: repActuelle === i ? epActuelle.couleur : '#eee', color: '#fff', textAlign: 'center', lineHeight: '22px', fontSize: '11px', fontWeight: '700', marginRight: '10px' }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIndexActuel(i => Math.max(0, i - 1))} disabled={indexActuel === 0}
                style={{ flex: 1, padding: '12px', background: indexActuel === 0 ? '#f0f0f0' : '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: indexActuel === 0 ? 'default' : 'pointer', fontSize: '14px', color: indexActuel === 0 ? '#ccc' : '#444' }}>
                ← Précédente
              </button>
              <button onClick={() => { if (indexActuel + 1 < qs.length) setIndexActuel(i => i + 1); else passerEpreuvesSuivante(); }}
                style={{ flex: 1, padding: '12px', background: epActuelle.couleur, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                {indexActuel + 1 === qs.length ? (epreuve + 1 >= EPREUVES.length ? 'Terminer ✓' : 'Épreuve suivante →') : 'Suivante →'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // EXPRESSION ÉCRITE
    if (epActuelle.type === 'redaction') {
      const nbMots = compterMots(redaction);
      return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
          {barreEpreuve}
          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px' }}>
            <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#185FA5', marginBottom: '6px' }}>{sujetEE?.tache}</p>
              <p style={{ fontSize: '14px', color: '#0C447C', lineHeight: '1.7' }}>{sujetEE?.sujet}</p>
              <p style={{ fontSize: '12px', color: '#378ADD', marginTop: '8px' }}>📝 {sujetEE?.minMots}–{sujetEE?.maxMots} mots requis</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <textarea value={redaction} onChange={e => setRedaction(e.target.value)}
                placeholder="Rédigez votre texte ici..."
                style={{ width: '100%', minHeight: '320px', border: 'none', outline: 'none', fontSize: '15px', lineHeight: '1.8', color: '#333', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: '13px', color: nbMots >= (sujetEE?.minMots || 0) ? '#1D9E75' : '#aaa', fontWeight: '500' }}>
                  {nbMots} mot{nbMots > 1 ? 's' : ''} / {sujetEE?.minMots}–{sujetEE?.maxMots} requis {nbMots >= (sujetEE?.minMots || 0) ? '✓' : ''}
                </span>
                <button onClick={passerEpreuvesSuivante}
                  style={{ padding: '10px 20px', background: '#EF9F27', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                  {epreuve + 1 >= EPREUVES.length ? 'Terminer ✓' : 'Épreuve suivante →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // EXPRESSION ORALE
    if (epActuelle.type === 'oral') {
      return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
          {barreEpreuve}
          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px' }}>
            <div style={{ background: '#FBEAF0', border: '1px solid #F0A8C0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#993556', marginBottom: '6px' }}>🎤 Sujet de l'expression orale</p>
              <p style={{ fontSize: '14px', color: '#7A1A3A', lineHeight: '1.7' }}>{sujetEO?.sujet}</p>
            </div>

            {phaseOrale === 'prep' && (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧠</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Temps de préparation</h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>Préparez mentalement votre réponse avant de commencer</p>
                <button onClick={demarrerEnregistrement}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #D4537E, #993556)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
                  🎙️ Commencer l'enregistrement
                </button>
              </div>
            )}

            {phaseOrale === 'enregistrement' && (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ width: '4px', height: `${12 + Math.random() * 20}px`, background: '#D4537E', borderRadius: '4px', animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate` }} />
                  ))}
                </div>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#D4537E', marginBottom: '8px' }}>🔴 Enregistrement en cours...</p>
                {transcription && <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px', fontStyle: 'italic' }}>"{transcription.slice(-100)}..."</p>}
                <button onClick={arreterEnregistrement}
                  style={{ padding: '12px 28px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                  ⏹ Arrêter l'enregistrement
                </button>
                <style>{`@keyframes pulse { from { transform: scaleY(0.5); } to { transform: scaleY(1); } }`}</style>
              </div>
            )}

            {phaseOrale === 'termine' && (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>✅ Enregistrement terminé</p>
                {audioURL && <audio controls src={audioURL} style={{ width: '100%', marginBottom: '12px' }} />}
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Transcription</p>
                  <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6' }}>{transcription || 'Aucune transcription détectée.'}</p>
                </div>
                <button onClick={passerEpreuvesSuivante}
                  style={{ width: '100%', padding: '14px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
                  {epreuve + 1 >= EPREUVES.length ? 'Terminer l\'examen ✓' : 'Épreuve suivante →'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // RÉSULTAT FINAL
  if (phase === 'resultat') {
    const qcmResults = resultatsParEpreuve.filter(r => r.type === 'qcm');
    const totalScore = qcmResults.reduce((acc, r) => acc + r.score, 0);
    const totalQCM = qcmResults.reduce((acc, r) => acc + r.total, 0);
    const pct = totalQCM > 0 ? Math.round((totalScore / totalQCM) * 100) : 0;
    const niveau = pct >= 80 ? 'C1' : pct >= 65 ? 'B2' : pct >= 50 ? 'B1' : 'A2';
    const couleurNiveau = { C1: '#1D9E75', B2: '#378ADD', B1: '#EF9F27', A2: '#E24B4A' }[niveau];

    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '40px 32px 80px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Examen terminé !</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Voici vos résultats détaillés</p>
        </div>

        <div style={{ maxWidth: '640px', margin: '-40px auto 0', padding: '0 20px 40px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', fontWeight: '800', color: couleurNiveau, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: '15px', color: '#888', marginTop: '8px' }}>{totalScore}/{totalQCM} bonnes réponses (QCM)</div>
            <div style={{ display: 'inline-block', marginTop: '12px', background: couleurNiveau + '20', color: couleurNiveau, padding: '6px 20px', borderRadius: '20px', fontSize: '18px', fontWeight: '800' }}>
              Niveau estimé : {niveau}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Résultats par épreuve</h3>
            {resultatsParEpreuve.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < resultatsParEpreuve.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <span style={{ fontSize: '20px' }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{r.label}</div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                    {r.type === 'qcm' ? `${r.score}/${r.total} bonnes réponses` : r.type === 'redaction' ? `${r.nbMots} mots rédigés` : `${r.nbMots} mots enregistrés`}
                  </div>
                </div>
                {r.type === 'qcm' && (
                  <div style={{ fontSize: '16px', fontWeight: '700', color: r.couleur }}>
                    {Math.round((r.score / r.total) * 100)}%
                  </div>
                )}
                {r.type !== 'qcm' && (
                  <div style={{ fontSize: '13px', fontWeight: '600', color: r.soumis ? '#1D9E75' : '#EF9F27' }}>
                    {r.soumis ? '✅ Soumis' : '⚠️ Incomplet'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setPhase('intro'); setEpreuve(0); setReponses({}); setRedaction(''); setTranscription(''); setResultatsParEpreuve([]); setAudioURL(null); setPhaseOrale('prep'); }}
              style={{ flex: 1, padding: '14px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
              Recommencer
            </button>
            <button onClick={onRetour}
              style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', color: '#444' }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
}

export default Simulateur;