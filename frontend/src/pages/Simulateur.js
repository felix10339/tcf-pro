import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from '../components/AudioPlayer';
import API_URL from '../config';
import sujetsEE from '../data/sujets-expression-ecrite';
import sujetsEO from '../data/sujets-expression-orale';
import {
  EPREUVES, TACHES_EE, TACHES_EO, NIVEAU_COULEUR,
  selectionnerQuestions, estimerScoreComprehension,
  scoreVersNCLC, scoreVersCECR, libelleNCLC, scorePourNCLC
} from '../data/tcfCanada';

const auHasard = arr => arr[Math.floor(Math.random() * arr.length)];
const tirerSujets = sujets => [1, 2, 3].map(n => auHasard(sujets.filter(s => s.numeroTache === n)));
const compterMots = t => t.trim().split(/\s+/).filter(Boolean).length;
const formatTemps = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const enteteAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const NCLC_CIBLE = 7; // seuil du Programme des travailleurs qualifiés (fédéral) dans les 4 compétences

const carte = { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const boutonPrincipal = couleur => ({ padding: '12px 20px', background: couleur, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' });

function Simulateur({ utilisateur, onRetour }) {
  const estPro = utilisateur?.abonnement === 'pro';

  const [phase, setPhase] = useState('intro'); // intro | chargement | epreuve | correction | resultat
  const [choix, setChoix] = useState(EPREUVES.map(e => e.key));
  const [epreuves, setEpreuves] = useState([]);
  const [indexEpreuve, setIndexEpreuve] = useState(0);
  const [tempsRestant, setTempsRestant] = useState(0);
  const [erreur, setErreur] = useState('');

  // Compréhension
  const [questions, setQuestions] = useState({});
  const [reponses, setReponses] = useState({});
  const [indexQuestion, setIndexQuestion] = useState(0);

  // Expression écrite
  const [sujetsEcrits, setSujetsEcrits] = useState([]);
  const [redactions, setRedactions] = useState(['', '', '']);
  const [tacheEE, setTacheEE] = useState(0);

  // Expression orale
  const [sujetsOraux, setSujetsOraux] = useState([]);
  const [tacheEO, setTacheEO] = useState(0);
  const [phaseOrale, setPhaseOrale] = useState('prep'); // prep | enregistrement | termine
  const [tempsOral, setTempsOral] = useState(0);
  const [transcriptions, setTranscriptions] = useState(['', '', '']);
  const [audios, setAudios] = useState([null, null, null]);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const enregistrementActifRef = useRef(false);

  const [resultats, setResultats] = useState({});

  const epActuelle = epreuves[indexEpreuve];

  // ————— Navigation entre épreuves —————
  const terminerEpreuve = () => {
    if (indexEpreuve + 1 >= epreuves.length) {
      finaliser();
    } else {
      setIndexEpreuve(i => i + 1);
      setIndexQuestion(0);
    }
  };
  // Le minuteur appelle toujours la version à jour de terminerEpreuve
  const terminerRef = useRef(terminerEpreuve);
  terminerRef.current = terminerEpreuve;

  // Minuteur global des épreuves de compréhension et d'expression écrite
  useEffect(() => {
    if (phase !== 'epreuve' || !epActuelle || epActuelle.type === 'oral') return;
    setTempsRestant(epActuelle.dureeMinutes * 60);
    const id = setInterval(() => {
      setTempsRestant(t => {
        if (t <= 1) { clearInterval(id); terminerRef.current(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, indexEpreuve, epActuelle]);

  // ————— Expression orale : préparation, puis enregistrement chronométré —————
  const arreterEnregistrement = () => {
    enregistrementActifRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    if (recognitionRef.current) recognitionRef.current.stop();
    setPhaseOrale('termine');
  };
  const arreterRef = useRef(arreterEnregistrement);
  arreterRef.current = arreterEnregistrement;

  const demarrerEnregistrement = async () => {
    const tache = tacheEO;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const morceaux = [];
      recorder.ondataavailable = e => morceaux.push(e.data);
      recorder.onstop = () => {
        const url = URL.createObjectURL(new Blob(morceaux, { type: 'audio/webm' }));
        setAudios(prev => prev.map((a, i) => (i === tache ? url : a)));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      enregistrementActifRef.current = true;

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.lang = 'fr-CA';
        recognition.continuous = true;
        recognition.interimResults = true;
        let stable = '';
        recognition.onresult = e => {
          let provisoire = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) stable += e.results[i][0].transcript + ' ';
            else provisoire += e.results[i][0].transcript;
          }
          setTranscriptions(prev => prev.map((t, i) => (i === tache ? stable + provisoire : t)));
        };
        // Chrome coupe parfois la reconnaissance après un silence : on la relance tant que l'enregistrement continue
        recognition.onend = () => { if (enregistrementActifRef.current) { try { recognition.start(); } catch { /* déjà relancée */ } } };
        recognitionRef.current = recognition;
        recognition.start();
      }
      setTempsOral(TACHES_EO[tache].dureeSecondes);
      setPhaseOrale('enregistrement');
    } catch {
      setErreur('Impossible d\'accéder au microphone. Autorisez le micro dans votre navigateur.');
    }
  };
  const demarrerRef = useRef(demarrerEnregistrement);
  demarrerRef.current = demarrerEnregistrement;

  // Compte à rebours de la tâche orale (préparation ou parole)
  useEffect(() => {
    if (phase !== 'epreuve' || epActuelle?.type !== 'oral') return;
    if (phaseOrale !== 'prep' && phaseOrale !== 'enregistrement') return;
    // Tâches sans préparation : on attend que le candidat lance l'enregistrement
    if (phaseOrale === 'prep' && TACHES_EO[tacheEO].preparationSecondes === 0) return;
    const id = setInterval(() => {
      setTempsOral(t => {
        if (t <= 1) {
          clearInterval(id);
          if (phaseOrale === 'prep') demarrerRef.current();
          else arreterRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, epActuelle, phaseOrale, tacheEO]);

  // À l'entrée dans l'épreuve orale ou dans une nouvelle tâche : temps de préparation éventuel
  useEffect(() => {
    if (phase !== 'epreuve' || epActuelle?.type !== 'oral') return;
    setTempsOral(TACHES_EO[tacheEO].preparationSecondes);
    setPhaseOrale('prep');
  }, [phase, epActuelle, tacheEO]);

  const tacheOraleSuivante = () => {
    if (tacheEO < 2) setTacheEO(t => t + 1);
    else terminerEpreuve();
  };

  // ————— Démarrage —————
  const commencerExamen = async () => {
    const choisies = EPREUVES.filter(e => choix.includes(e.key));
    if (!choisies.length) return;
    setErreur('');
    setPhase('chargement');
    try {
      const qcm = choisies.filter(e => e.type === 'qcm');
      const lots = await Promise.all(qcm.map(e => axios.get(`${API_URL}/api/questions/section/${e.key}`)));
      const parSection = {};
      qcm.forEach((e, i) => { parSection[e.key] = selectionnerQuestions(lots[i].data, e.nbQuestions); });
      setQuestions(parSection);
    } catch {
      setErreur('Impossible de charger les questions. Vérifiez votre connexion et réessayez.');
      setPhase('intro');
      return;
    }
    setSujetsEcrits(tirerSujets(sujetsEE));
    setSujetsOraux(tirerSujets(sujetsEO));
    setReponses({}); setRedactions(['', '', '']); setTranscriptions(['', '', '']); setAudios([null, null, null]);
    setTacheEE(0); setTacheEO(0); setIndexQuestion(0); setIndexEpreuve(0); setResultats({});
    setEpreuves(choisies);
    setPhase('epreuve');
  };

  // ————— Correction et calcul des scores —————
  const corrigerParIA = async (route, corps) => {
    try {
      const res = await axios.post(`${API_URL}/api/ia/${route}`, corps, enteteAuth());
      return res.data;
    } catch {
      return null;
    }
  };

  const finaliser = async () => {
    setPhase('correction');
    const res = {};

    epreuves.filter(e => e.type === 'qcm').forEach(e => {
      const qs = questions[e.key] || [];
      const rep = reponses[e.key] || {};
      const score = estimerScoreComprehension(qs, rep);
      res[e.key] = { score, max: 699, justes: qs.filter((q, i) => rep[i] === q.correct).length, total: qs.length };
    });

    const ee = epreuves.find(e => e.key === 'expression-ecrite');
    if (ee) {
      const mots = redactions.map(compterMots);
      let note = null;
      let details = [];
      if (estPro) {
        details = await Promise.all(sujetsEcrits.map((s, i) => mots[i] < 20 ? null : corrigerParIA('corriger-redaction', {
          tache: s.tache,
          sujet: s.documents ? `${s.sujet}\n${s.documents.join('\n')}` : s.sujet,
          redaction: redactions[i], niveau: s.niveau, minMots: s.minMots, maxMots: s.maxMots
        })));
        if (details.some(Boolean)) note = Math.round(details.reduce((acc, d) => acc + (d ? (d.note / (d.note_max || 20)) * 20 : 0), 0) / 3);
      }
      res['expression-ecrite'] = { score: note, max: 20, mots, details };
    }

    const eo = epreuves.find(e => e.key === 'expression-orale');
    if (eo) {
      const mots = transcriptions.map(compterMots);
      let note = null;
      let details = [];
      if (estPro) {
        details = await Promise.all(sujetsOraux.map((s, i) => mots[i] < 10 ? null : corrigerParIA('corriger-oral', {
          tache: s.tache, sujet: s.sujet, transcription: transcriptions[i], niveau: s.niveau,
          dureeEnregistree: TACHES_EO[i].dureeSecondes, dureeAttandue: TACHES_EO[i].dureeSecondes
        })));
        if (details.some(Boolean)) note = Math.round(details.reduce((acc, d) => acc + (d ? (d.note / (d.note_max || 20)) * 20 : 0), 0) / 3);
      }
      res['expression-orale'] = { score: note, max: 20, mots, details };
    }

    setResultats(res);
    setPhase('resultat');
  };

  // ═════════════ INTRO ═════════════
  if (phase === 'intro') {
    const dureeTotale = EPREUVES.filter(e => choix.includes(e.key)).reduce((acc, e) => acc + e.dureeMinutes, 0);
    const basculer = key => setChoix(c => (c.includes(key) ? c.filter(k => k !== key) : [...c, key]));
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '40px 20px 80px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍁</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Simulateur TCF Canada</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px' }}>Format officiel · Résultat converti en NCLC</p>
        </div>
        <div style={{ maxWidth: '620px', margin: '-40px auto 0', padding: '0 16px 40px' }}>
          <div style={{ ...carte, padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Choisissez vos épreuves</h3>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>Comme à l'examen officiel, vous pouvez passer les 4 épreuves ou seulement certaines.</p>
            {EPREUVES.map((ep, i) => {
              const actif = choix.includes(ep.key);
              return (
                <label key={ep.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < EPREUVES.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
                  <input type="checkbox" checked={actif} onChange={() => basculer(ep.key)} style={{ width: '18px', height: '18px', accentColor: ep.couleur }} />
                  <div style={{ fontSize: '22px' }}>{ep.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: actif ? '#1a1a2e' : '#aaa' }}>{ep.label}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {ep.type === 'qcm' ? `${ep.nbQuestions} questions, de A1 à C2` : `${ep.nbTaches} tâches`} · noté {ep.bareme}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: ep.couleur }}>{ep.dureeMinutes} min</div>
                </label>
              );
            })}
            <div style={{ marginTop: '14px', background: '#f9fafb', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Durée totale</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1D9E75' }}>{Math.floor(dureeTotale / 60) ? `${Math.floor(dureeTotale / 60)} h ` : ''}{dureeTotale % 60} min</span>
            </div>
            {!estPro && (choix.includes('expression-ecrite') || choix.includes('expression-orale')) && (
              <p style={{ fontSize: '12px', color: '#B7791F', background: '#FFF8E6', borderRadius: '8px', padding: '10px 12px', marginTop: '12px' }}>
                ⭐ La note /20 et le NCLC des épreuves d'expression sont calculés par l'IA, réservée aux membres Pro. Vous pourrez quand même vous entraîner.
              </p>
            )}
          </div>
          {erreur && <p style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '12px' }}>⚠️ {erreur}</p>}
          <button onClick={commencerExamen} disabled={!choix.length}
            style={{ ...boutonPrincipal(choix.length ? 'linear-gradient(135deg, #1D9E75, #0F6E56)' : '#ccc'), width: '100%', padding: '16px', fontSize: '16px' }}>
            Commencer l'examen →
          </button>
          <button onClick={onRetour} style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'transparent', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#666' }}>
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'chargement' || phase === 'correction') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>{phase === 'chargement' ? '⏳' : '🧮'}</div>
        <p style={{ fontSize: '16px', color: '#666' }}>{phase === 'chargement' ? 'Préparation de votre examen…' : 'Calcul de vos résultats…'}</p>
      </div>
    </div>
  );

  // ═════════════ ÉPREUVE EN COURS ═════════════
  if (phase === 'epreuve' && epActuelle) {
    const estOral = epActuelle.type === 'oral';
    const tempsAffiche = estOral ? tempsOral : tempsRestant;
    const couleurTemps = !estOral && tempsRestant < 120 ? '#E24B4A' : !estOral && tempsRestant < 300 ? '#EF9F27' : '#1D9E75';
    const dernier = indexEpreuve + 1 >= epreuves.length;

    const barre = (
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #eee', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Épreuve {indexEpreuve + 1}/{epreuves.length} — {epActuelle.emoji} {epActuelle.label}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {epreuves.map((ep, i) => (
              <div key={ep.key} style={{ width: '20px', height: '4px', borderRadius: '2px', background: i < indexEpreuve ? '#1D9E75' : i === indexEpreuve ? ep.couleur : '#eee' }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: couleurTemps, fontVariantNumeric: 'tabular-nums' }}>⏱ {formatTemps(tempsAffiche)}</div>
        {!estOral && (
          <button onClick={terminerEpreuve} style={{ ...boutonPrincipal('#1D9E75'), padding: '8px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}>
            {dernier ? 'Terminer ✓' : 'Épreuve suivante →'}
          </button>
        )}
      </div>
    );

    // ——— Compréhension orale / écrite ———
    if (epActuelle.type === 'qcm') {
      const qs = questions[epActuelle.key] || [];
      if (!qs.length) return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>{barre}
          <div style={{ ...carte, maxWidth: '520px', margin: '40px auto', textAlign: 'center' }}>
            <p style={{ marginBottom: '16px' }}>Aucune question disponible pour cette épreuve pour le moment.</p>
            <button onClick={terminerEpreuve} style={boutonPrincipal(epActuelle.couleur)}>Continuer →</button>
          </div>
        </div>
      );
      const q = qs[indexQuestion];
      const repEpreuve = reponses[epActuelle.key] || {};
      const choisir = i => setReponses(prev => ({ ...prev, [epActuelle.key]: { ...(prev[epActuelle.key] || {}), [indexQuestion]: i } }));
      const estOrale = epActuelle.key === 'comprehension-orale';

      return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
          {barre}
          <div style={{ height: '3px', background: '#eee' }}>
            <div style={{ height: '100%', width: `${((indexQuestion + 1) / qs.length) * 100}%`, background: epActuelle.couleur, transition: 'width 0.4s' }} />
          </div>
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {qs.map((qq, i) => {
                const repondu = repEpreuve[i] !== undefined;
                return (
                  <button key={i} onClick={() => setIndexQuestion(i)} title={qq.niveau}
                    style={{ width: '30px', height: '30px', borderRadius: '7px', border: i === indexQuestion ? `2px solid ${epActuelle.couleur}` : '1px solid #ddd', background: repondu ? '#E1F5EE' : '#fff', color: repondu ? '#0F6E56' : '#666', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ ...carte, padding: '22px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#999' }}>Question {indexQuestion + 1} / {qs.length}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: NIVEAU_COULEUR[q.niveau], background: NIVEAU_COULEUR[q.niveau] + '20', padding: '3px 10px', borderRadius: '20px' }}>{q.niveau}</span>
              </div>
              {estOrale ? (
                <>
                  {q.texte && <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>🎧 {q.texte}</p>}
                  <AudioPlayer key={q.id || indexQuestion} texte={q.audio_texte || q.texte} />
                </>
              ) : (
                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#333' }}>{q.texte}</p>
                </div>
              )}
              <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>{q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, i) => {
                  const sel = repEpreuve[indexQuestion] === i;
                  return (
                    <button key={i} onClick={() => choisir(i)}
                      style={{ padding: '12px 14px', borderRadius: '10px', textAlign: 'left', border: sel ? `2px solid ${epActuelle.couleur}` : '1.5px solid #e8e8e8', background: sel ? epActuelle.couleur + '15' : '#fff', color: '#333', cursor: 'pointer', fontSize: '14px', fontWeight: sel ? '600' : '400' }}>
                      <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', background: sel ? epActuelle.couleur : '#eee', color: '#fff', textAlign: 'center', lineHeight: '22px', fontSize: '11px', fontWeight: '700', marginRight: '10px' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIndexQuestion(i => Math.max(0, i - 1))} disabled={indexQuestion === 0}
                style={{ flex: 1, padding: '12px', background: indexQuestion === 0 ? '#f0f0f0' : '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: indexQuestion === 0 ? 'default' : 'pointer', fontSize: '14px', color: indexQuestion === 0 ? '#ccc' : '#444' }}>
                ← Précédente
              </button>
              <button onClick={() => (indexQuestion + 1 < qs.length ? setIndexQuestion(i => i + 1) : terminerEpreuve())}
                style={{ ...boutonPrincipal(epActuelle.couleur), flex: 1 }}>
                {indexQuestion + 1 === qs.length ? (dernier ? 'Terminer ✓' : 'Épreuve suivante →') : 'Suivante →'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ——— Expression écrite : 3 tâches, 60 minutes au total ———
    if (epActuelle.type === 'redaction') {
      const sujet = sujetsEcrits[tacheEE];
      const nbMots = compterMots(redactions[tacheEE]);
      const okMots = nbMots >= sujet.minMots && nbMots <= sujet.maxMots;
      return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
          {barre}
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {TACHES_EE.map((t, i) => {
                const n = compterMots(redactions[i]);
                return (
                  <button key={t.numero} onClick={() => setTacheEE(i)}
                    style={{ flex: 1, padding: '10px 6px', borderRadius: '10px', border: i === tacheEE ? '2px solid #EF9F27' : '1px solid #ddd', background: i === tacheEE ? '#FFF6E8' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#7A4B00' }}>
                    Tâche {t.numero}
                    <div style={{ fontSize: '11px', fontWeight: '500', color: n ? '#1D9E75' : '#aaa', marginTop: '2px' }}>{n ? `${n} mots` : t.nom}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ background: '#FFF6E8', border: '1px solid #F5D49A', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#7A4B00', marginBottom: '6px' }}>{sujet.tache}</p>
              <p style={{ fontSize: '14px', color: '#4A2E00', lineHeight: '1.7' }}>{sujet.sujet}</p>
              {sujet.documents && sujet.documents.map((d, i) => (
                <p key={i} style={{ fontSize: '13px', color: '#4A2E00', lineHeight: '1.6', background: '#fff', borderLeft: '3px solid #EF9F27', borderRadius: '6px', padding: '10px 12px', marginTop: '10px' }}>{d}</p>
              ))}
              <p style={{ fontSize: '12px', color: '#B7791F', marginTop: '10px' }}>📝 {sujet.minMots} à {sujet.maxMots} mots</p>
            </div>

            <div style={carte}>
              <textarea value={redactions[tacheEE]} onChange={e => { const v = e.target.value; setRedactions(prev => prev.map((r, i) => (i === tacheEE ? v : r))); }}
                placeholder="Rédigez votre texte ici…"
                style={{ width: '100%', minHeight: '280px', border: 'none', outline: 'none', fontSize: '15px', lineHeight: '1.8', color: '#333', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: okMots ? '#1D9E75' : nbMots > sujet.maxMots ? '#E24B4A' : '#aaa' }}>
                  {nbMots} mot{nbMots > 1 ? 's' : ''} / {sujet.minMots}–{sujet.maxMots} {okMots ? '✓' : ''}
                </span>
                {tacheEE < 2 ? (
                  <button onClick={() => setTacheEE(t => t + 1)} style={boutonPrincipal('#EF9F27')}>Tâche suivante →</button>
                ) : (
                  <button onClick={terminerEpreuve} style={boutonPrincipal('#EF9F27')}>{dernier ? 'Terminer ✓' : 'Épreuve suivante →'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ——— Expression orale : 3 tâches chronométrées ———
    if (epActuelle.type === 'oral') {
      const sujet = sujetsOraux[tacheEO];
      const tache = TACHES_EO[tacheEO];
      return (
        <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
          {barre}
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {TACHES_EO.map((t, i) => (
                <div key={t.numero} style={{ flex: 1, padding: '8px 6px', borderRadius: '10px', textAlign: 'center', fontSize: '12px', fontWeight: '700', border: i === tacheEO ? '2px solid #D4537E' : '1px solid #e5e5e5', background: i < tacheEO ? '#E1F5EE' : i === tacheEO ? '#FBEAF0' : '#fff', color: i < tacheEO ? '#0F6E56' : '#993556' }}>
                  {i < tacheEO ? '✓ ' : ''}Tâche {t.numero}
                </div>
              ))}
            </div>

            <div style={{ background: '#FBEAF0', border: '1px solid #F0A8C0', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#993556', marginBottom: '4px' }}>🎤 {sujet.tache}</p>
              <p style={{ fontSize: '12px', color: '#B5577A', marginBottom: '8px' }}>{tache.description}</p>
              <p style={{ fontSize: '14px', color: '#7A1A3A', lineHeight: '1.7' }}>{sujet.sujet}</p>
            </div>

            {erreur && <p style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '12px' }}>⚠️ {erreur}</p>}

            {phaseOrale === 'prep' && (
              <div style={{ ...carte, padding: '26px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🧠</div>
                {tache.preparationSecondes > 0 ? (
                  <>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>Préparation : {formatTemps(tempsOral)}</h3>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>Notez vos questions. L'enregistrement démarrera automatiquement.</p>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>Pas de préparation pour cette tâche</h3>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>Vous aurez {formatTemps(tache.dureeSecondes)} pour parler. Commencez quand vous êtes prêt(e).</p>
                  </>
                )}
                <button onClick={demarrerEnregistrement} style={{ ...boutonPrincipal('linear-gradient(135deg, #D4537E, #993556)'), width: '100%', padding: '14px' }}>
                  🎙️ {tache.preparationSecondes > 0 ? 'Je suis prêt(e), commencer' : 'Commencer l\'enregistrement'}
                </button>
              </div>
            )}

            {phaseOrale === 'enregistrement' && (
              <div style={{ ...carte, padding: '26px', textAlign: 'center' }}>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#D4537E', marginBottom: '8px' }}>🔴 Enregistrement en cours</p>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>Temps restant : {formatTemps(tempsOral)}</p>
                {transcriptions[tacheEO] && <p style={{ fontSize: '13px', color: '#777', marginBottom: '16px', fontStyle: 'italic' }}>« …{transcriptions[tacheEO].slice(-120)} »</p>}
                <button onClick={arreterEnregistrement} style={boutonPrincipal('#E24B4A')}>⏹ J'ai terminé</button>
              </div>
            )}

            {phaseOrale === 'termine' && (
              <div style={carte}>
                <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>✅ Tâche {tache.numero} terminée</p>
                {audios[tacheEO] && <audio controls src={audios[tacheEO]} style={{ width: '100%', marginBottom: '12px' }} />}
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Transcription</p>
                  <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6' }}>{transcriptions[tacheEO] || 'Aucune transcription détectée (la reconnaissance vocale fonctionne mieux dans Chrome).'}</p>
                </div>
                <button onClick={tacheOraleSuivante} style={{ ...boutonPrincipal('#D4537E'), width: '100%', padding: '14px' }}>
                  {tacheEO < 2 ? 'Tâche suivante →' : dernier ? 'Terminer l\'examen ✓' : 'Épreuve suivante →'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // ═════════════ RÉSULTATS ═════════════
  if (phase === 'resultat') {
    const lignes = epreuves.map(ep => {
      const r = resultats[ep.key] || {};
      const nclc = r.score === null || r.score === undefined ? null : scoreVersNCLC(ep.key, r.score);
      return { ep, r, nclc };
    });
    const notees = lignes.filter(l => l.nclc !== null);
    const nclcMin = notees.length ? Math.min(...notees.map(l => l.nclc)) : null;
    const objectifAtteint = notees.length === 4 && nclcMin >= NCLC_CIBLE;

    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '40px 20px 80px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '46px', marginBottom: '10px' }}>{objectifAtteint ? '🎉' : '📊'}</div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>Vos résultats estimés</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>Équivalences NCLC utilisées par IRCC</p>
        </div>

        <div style={{ maxWidth: '660px', margin: '-40px auto 0', padding: '0 16px 40px' }}>
          {nclcMin !== null && (
            <div style={{ ...carte, padding: '24px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Votre niveau le plus faible</div>
              <div style={{ fontSize: '44px', fontWeight: '800', color: nclcMin >= NCLC_CIBLE ? '#1D9E75' : '#EF9F27' }}>{libelleNCLC(nclcMin)}</div>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: '1.6' }}>
                {objectifAtteint
                  ? 'Vous atteignez NCLC 7 dans les 4 compétences, le minimum demandé par le Programme des travailleurs qualifiés (fédéral).'
                  : `Pour Entrée express, IRCC tient compte de chaque compétence séparément. Visez au moins NCLC ${NCLC_CIBLE} partout.`}
              </p>
            </div>
          )}

          <div style={{ ...carte, marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Détail par épreuve</h3>
            {lignes.map(({ ep, r, nclc }, i) => {
              const cible = scorePourNCLC(ep.key, NCLC_CIBLE);
              return (
                <div key={ep.key} style={{ padding: '14px 0', borderBottom: i < lignes.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '22px' }}>{ep.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{ep.label}</div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                        {ep.type === 'qcm' && `${r.justes}/${r.total} bonnes réponses · niveau ${scoreVersCECR(r.score)}`}
                        {ep.type !== 'qcm' && r.mots && `Mots par tâche : ${r.mots.join(' · ')}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {r.score !== null && r.score !== undefined ? (
                        <>
                          <div style={{ fontSize: '17px', fontWeight: '800', color: ep.couleur }}>{r.score}<span style={{ fontSize: '12px', color: '#aaa' }}>/{r.max}</span></div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: nclc >= NCLC_CIBLE ? '#1D9E75' : '#EF9F27' }}>{libelleNCLC(nclc)}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#B7791F', fontWeight: '600', maxWidth: '130px' }}>{estPro ? 'Correction indisponible' : '⭐ Note avec Pro'}</div>
                      )}
                    </div>
                  </div>
                  {nclc !== null && nclc < NCLC_CIBLE && cible !== null && (
                    <p style={{ fontSize: '12px', color: '#888', marginTop: '8px', marginLeft: '34px' }}>
                      Il vous manque {cible - r.score} point{cible - r.score > 1 ? 's' : ''} pour atteindre NCLC {NCLC_CIBLE} ({cible}/{r.max}).
                    </p>
                  )}
                  {r.details && r.details.some(Boolean) && (
                    <div style={{ marginTop: '8px', marginLeft: '34px' }}>
                      {r.details.map((d, t) => d && (
                        <p key={t} style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          <strong>Tâche {t + 1}</strong> : {d.note}/{d.note_max || 20}{d.conseils ? ` — ${d.conseils}` : ''}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginBottom: '16px', lineHeight: '1.5' }}>
            Estimation pédagogique : seul le TCF Canada officiel donne un résultat reconnu par IRCC.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setPhase('intro')} style={{ ...boutonPrincipal('#1D9E75'), flex: 1, padding: '14px' }}>Recommencer</button>
            <button onClick={onRetour} style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', color: '#444' }}>Tableau de bord</button>
          </div>
        </div>
      </div>
    );
  }

  return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement…</div>;
}

export default Simulateur;
