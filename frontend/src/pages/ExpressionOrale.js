import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import sujets from '../data/sujets-expression-orale';

function ExpressionOrale({ onRetour }) {
  const [phase, setPhase] = useState('choix');
  const [sujetChoisi, setSujetChoisi] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [tempsRestant, setTempsRestant] = useState(0);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [chargement, setChargement] = useState(false);
  const [correction, setCorrection] = useState(null);
  const [preparation, setPreparation] = useState(true);
  const [tempsPrep, setTempsPrep] = useState(30);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const prepTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  const niveauCouleur = { 'B1': '#1D9E75', 'B2': '#378ADD', 'C1': '#7F77DD' };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(prepTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const commencerPreparation = (sujet) => {
    setSujetChoisi(sujet);
    setTempsRestant(sujet.duree);
    setTempsPrep(30);
    setPhase('preparation');

    prepTimerRef.current = setInterval(() => {
      setTempsPrep(t => {
        if (t <= 1) {
          clearInterval(prepTimerRef.current);
          setPreparation(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const demarrerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setEnregistrement(true);
      setTempsEcoule(0);

      timerRef.current = setInterval(() => {
        setTempsEcoule(t => {
          if (t + 1 >= sujetChoisi.duree) {
            arreterEnregistrement();
            return t + 1;
          }
          return t + 1;
        });
        setTempsRestant(r => Math.max(0, r - 1));
      }, 1000);

      // Reconnaissance vocale
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = true;

        let texteStable = '';
        recognition.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) texteStable += e.results[i][0].transcript + ' ';
            else interim += e.results[i][0].transcript;
          }
          setTranscription(texteStable + interim);
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

    } catch (err) {
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions de votre navigateur.');
    }
  };

  const arreterEnregistrement = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    setEnregistrement(false);
    setPhase('review');
  };

  const soumettrePourCorrection = async () => {
    if (!transcription.trim()) {
      alert('La transcription est vide. Assurez-vous que votre microphone fonctionne.');
      return;
    }
    setChargement(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ia/corriger-oral`, {
        tache: sujetChoisi.tache,
        sujet: sujetChoisi.sujet,
        transcription,
        niveau: sujetChoisi.niveau,
        dureeEnregistree: tempsEcoule,
        dureeAttandue: sujetChoisi.duree
      });
      setCorrection(res.data);
      setPhase('correction');
    } catch (err) {
      alert('Erreur lors de la correction. Vérifiez votre crédit Anthropic.');
    } finally {
      setChargement(false);
    }
  };

  const formatTemps = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const pctTemps = sujetChoisi ? Math.min((tempsEcoule / sujetChoisi.duree) * 100, 100) : 0;

  // CHOIX DU SUJET
  if (phase === 'choix') return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '32px 32px 70px', color: '#fff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 }}>← Retour</button>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>🎤 Expression orale</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Enregistrez votre monologue — l'IA transcrit et corrige votre production orale</p>
        </div>
      </div>
      <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>
        <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#0C447C', lineHeight: '1.6' }}>
            🎙️ <strong>Comment ça marche :</strong> Choisissez un sujet → 30 secondes de préparation → enregistrez votre monologue → l'IA corrige votre production et vous donne un score.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sujets.map(s => (
            <div key={s.id} onClick={() => commencerPreparation(s)}
              style={{ background: '#fff', borderRadius: '14px', padding: '20px 24px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '2px solid transparent', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = niveauCouleur[s.niveau]; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: niveauCouleur[s.niveau] }}>{s.tache}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: niveauCouleur[s.niveau] + '20', color: niveauCouleur[s.niveau], fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>{s.niveau}</span>
                  <span style={{ background: '#f4f6f8', color: '#666', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' }}>⏱ {formatTemps(s.duree)}</span>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', marginBottom: '8px' }}>{s.sujet}</p>
              <div style={{ fontSize: '12px', color: '#aaa' }}>Points évalués : {s.points.join(' · ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // PREPARATION
  if (phase === 'preparation') return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '560px', width: '100%', padding: '20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Temps de préparation</h2>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>Préparez mentalement votre réponse</p>

          <div style={{ fontSize: '72px', fontWeight: '800', color: tempsPrep <= 10 ? '#E24B4A' : '#1D9E75', marginBottom: '16px', fontVariantNumeric: 'tabular-nums' }}>
            {tempsPrep}
          </div>
          <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ height: '100%', width: `${(tempsPrep / 30) * 100}%`, background: tempsPrep <= 10 ? '#E24B4A' : '#1D9E75', borderRadius: '6px', transition: 'width 1s linear' }} />
          </div>

          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.7', fontWeight: '500', marginBottom: '12px' }}>{sujetChoisi.sujet}</p>
            {sujetChoisi.conseils.map((c, i) => (
              <p key={i} style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>💡 {c}</p>
            ))}
          </div>

          <button onClick={demarrerEnregistrement}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #D4537E, #993556)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
            🎙️ Commencer l'enregistrement
          </button>
          {tempsPrep > 0 && (
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '10px' }}>L'enregistrement démarrera automatiquement dans {tempsPrep}s</p>
          )}
        </div>
      </div>
    </div>
  );

  // ENREGISTREMENT
  if (phase === 'preparation' && !preparation || phase === 'enregistrement') return null;

  // REVIEW avant soumission
  if (phase === 'review') return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '28px 32px 60px', color: '#fff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>🎙️ Enregistrement terminé</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Vérifiez votre enregistrement avant de soumettre</p>
        </div>
      </div>
      <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>

        {/* Stats enregistrement */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { val: formatTemps(tempsEcoule), label: 'Durée enregistrée', couleur: '#1D9E75' },
            { val: formatTemps(sujetChoisi.duree), label: 'Durée cible', couleur: '#378ADD' },
            { val: transcription.trim().split(/\s+/).filter(m => m.length > 0).length, label: 'Mots détectés', couleur: '#EF9F27' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '14px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: s.couleur }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Lecteur audio */}
        {audioURL && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>🔊 Réécouter votre enregistrement</p>
            <audio controls src={audioURL} style={{ width: '100%' }} />
          </div>
        )}

        {/* Transcription */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>📝 Transcription automatique</p>
          {transcription ? (
            <div>
              <textarea
                value={transcription}
                onChange={e => setTranscription(e.target.value)}
                style={{ width: '100%', minHeight: '120px', border: '1px solid #eee', borderRadius: '8px', padding: '12px', fontSize: '14px', lineHeight: '1.7', color: '#444', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
              />
              <p style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Vous pouvez corriger la transcription si nécessaire avant de soumettre.</p>
            </div>
          ) : (
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#888' }}>Aucune transcription détectée.</p>
              <p style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Tapez votre texte manuellement ci-dessous ou vérifiez les permissions du microphone.</p>
              <textarea
                value={transcription}
                onChange={e => setTranscription(e.target.value)}
                placeholder="Tapez ici ce que vous avez dit..."
                style={{ width: '100%', minHeight: '100px', border: '1px solid #eee', borderRadius: '8px', padding: '12px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', marginTop: '10px', resize: 'vertical' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setPhase('choix'); setTranscription(''); setAudioURL(null); setTempsEcoule(0); }}
            style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#444' }}>
            Recommencer
          </button>
          <button onClick={soumettrePourCorrection} disabled={chargement || !transcription.trim()}
            style={{ flex: 2, padding: '14px', background: !transcription.trim() || chargement ? '#ccc' : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '12px', cursor: !transcription.trim() || chargement ? 'default' : 'pointer', fontSize: '15px', fontWeight: '700' }}>
            {chargement ? '⏳ Correction en cours...' : '🤖 Soumettre pour correction IA'}
          </button>
        </div>
      </div>
    </div>
  );

  // CORRECTION
  if (phase === 'correction' && correction) {
    const couleurNote = correction.note / correction.note_max >= 0.75 ? '#1D9E75' : correction.note / correction.note_max >= 0.5 ? '#EF9F27' : '#E24B4A';
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '32px 32px 70px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎤</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>Correction orale IA</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{sujetChoisi.tache}</p>
        </div>
        <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>

          {/* Note */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', fontWeight: '800', color: couleurNote }}>{correction.note}<span style={{ fontSize: '24px', color: '#aaa' }}>/{correction.note_max}</span></div>
            <div style={{ display: 'inline-block', marginTop: '8px', background: couleurNote + '20', color: couleurNote, padding: '5px 16px', borderRadius: '20px', fontSize: '15px', fontWeight: '700' }}>
              Niveau estimé : {correction.niveau_estime}
            </div>
          </div>

          {/* Critères détaillés */}
          {correction.criteres && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '14px' }}>📊 Critères d'évaluation</p>
              {correction.criteres.map((c, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{c.nom}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1D9E75' }}>{c.note}/{c.max}</span>
                  </div>
                  <div style={{ height: '5px', background: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c.note / c.max) * 100}%`, background: '#1D9E75', borderRadius: '5px' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{c.commentaire}</p>
                </div>
              ))}
            </div>
          )}

          {/* Points forts */}
          <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F6E56', marginBottom: '10px' }}>✅ Points forts</p>
            {correction.points_forts?.map((p, i) => <p key={i} style={{ fontSize: '14px', color: '#085041', marginBottom: '4px' }}>• {p}</p>)}
          </div>

          {/* Points à améliorer */}
          <div style={{ background: '#FAEEDA', border: '1px solid #FAC775', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#854F0B', marginBottom: '10px' }}>⚠️ Points à améliorer</p>
            {correction.points_ameliorer?.map((p, i) => <p key={i} style={{ fontSize: '14px', color: '#633806', marginBottom: '4px' }}>• {p}</p>)}
          </div>

          {/* Conseil global */}
          <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#185FA5', marginBottom: '8px' }}>💡 Conseil de votre professeur IA</p>
            <p style={{ fontSize: '14px', color: '#0C447C', lineHeight: '1.7' }}>{correction.conseils}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setPhase('choix'); setTranscription(''); setAudioURL(null); setCorrection(null); setTempsEcoule(0); }}
              style={{ flex: 1, padding: '14px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
              Autre sujet
            </button>
            <button onClick={onRetour}
              style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#444' }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
}

export default ExpressionOrale;