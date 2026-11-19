import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from '../components/AudioPlayer';
import ImageDocument from '../components/ImageDocument';
import API_URL from '../config';
import EntetePage from '../components/EntetePage';
import Icone from '../components/Icone';
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
const ICONE = { 'comprehension-orale': 'casque', 'comprehension-ecrite': 'livre', 'expression-ecrite': 'stylo', 'expression-orale': 'micro' };
const NCLC_CIBLE = 7; // seuil du Programme des travailleurs qualifiés (fédéral) dans les 4 compétences


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
      <div>
        <EntetePage titre="Examen blanc TCF Canada" sousTitre="Format officiel, chronométré, avec un résultat converti en NCLC pour chaque compétence." onRetour={onRetour} />
        <main className="conteneur chevauche" style={{ maxWidth: 720, paddingBottom: 56 }}>
          <div className="carte" style={{ marginBottom: 16 }}>
            <h2 className="titre-3" style={{ marginBottom: 4 }}>Choisissez vos épreuves</h2>
            <p className="petit texte-3" style={{ marginBottom: 12 }}>Comme à l'examen officiel, vous pouvez passer les 4 épreuves ou seulement certaines.</p>
            {EPREUVES.map((ep, i) => {
              const actif = choix.includes(ep.key);
              return (
                <label key={ep.key} className="ligne gap-3" style={{ padding: '14px 0', borderTop: i ? '1px solid var(--bordure)' : 'none', cursor: 'pointer' }}>
                  <input type="checkbox" checked={actif} onChange={() => basculer(ep.key)} style={{ width: 18, height: 18, accentColor: 'var(--action)' }} />
                  <span className="pastille-icone" style={{ width: 38, height: 38, background: 'var(--surface-2)', color: ep.couleur }}><Icone nom={ICONE[ep.key]} taille={18} /></span>
                  <div style={{ flex: 1 }}>
                    <div className="gras" style={{ color: actif ? 'var(--texte)' : 'var(--texte-3)' }}>{ep.label}</div>
                    <div className="petit texte-3">{ep.type === 'qcm' ? `${ep.nbQuestions} questions, de A1 à C2` : `${ep.nbTaches} tâches`} · noté {ep.bareme}</div>
                  </div>
                  <span className="badge chiffres"><Icone nom="chrono" taille={12} /> {ep.dureeMinutes} min</span>
                </label>
              );
            })}
            <div className="ligne entre" style={{ marginTop: 8, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)' }}>
              <span className="gras">Durée totale</span>
              <span className="gras chiffres">{Math.floor(dureeTotale / 60) ? `${Math.floor(dureeTotale / 60)} h ` : ''}{dureeTotale % 60} min</span>
            </div>
            {!estPro && (choix.includes('expression-ecrite') || choix.includes('expression-orale')) && (
              <div className="encadre encadre-alerte" style={{ marginTop: 12 }}>
                <Icone nom="etoile" taille={16} style={{ flexShrink: 0, marginTop: 3 }} />
                La note /20 et le NCLC des épreuves d'expression sont calculés par l'IA, réservée aux membres Pro.
              </div>
            )}
          </div>
          {erreur && <div className="message-erreur" role="alert" style={{ marginBottom: 12 }}>{erreur}</div>}
          <button className="btn btn-primaire btn-grand btn-plein" onClick={commencerExamen} disabled={!choix.length}>
            Commencer l'examen <Icone nom="fleche" taille={18} />
          </button>
        </main>
      </div>
    );
  }

  if (phase === 'chargement' || phase === 'correction') return (
    <div className="conteneur-etroit section centre">
      <div className="chargeur" style={{ margin: '0 auto 16px' }} />
      <p className="titre-3" style={{ marginBottom: 4 }}>{phase === 'chargement' ? 'Préparation de votre examen…' : 'Calcul de vos résultats…'}</p>
      {phase === 'correction' && <p className="petit texte-3">L'IA corrige vos productions, cela peut prendre une minute.</p>}
    </div>
  );

  // ═════════════ ÉPREUVE EN COURS ═════════════
  if (phase === 'epreuve' && epActuelle) {
    const estOral = epActuelle.type === 'oral';
    const tempsAffiche = estOral ? tempsOral : tempsRestant;
    const urgent = !estOral && tempsRestant < 120;
    const dernier = indexEpreuve + 1 >= epreuves.length;

    const barre = (
      <div className="nav" style={{ top: 64, zIndex: 90 }}>
        <div className="conteneur ligne entre gap-2" style={{ minHeight: 56, maxWidth: 900 }}>
          <div style={{ minWidth: 0 }}>
            <div className="ligne gap-1 petit gras" style={{ color: epActuelle.couleur, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Icone nom={ICONE[epActuelle.key]} taille={16} /> {epActuelle.label}
            </div>
            <div className="ligne gap-1" style={{ marginTop: 5 }}>
              {epreuves.map((ep, i) => (
                <span key={ep.key} style={{ width: 22, height: 4, borderRadius: 2, background: i < indexEpreuve ? 'var(--succes)' : i === indexEpreuve ? ep.couleur : 'var(--bordure)' }} />
              ))}
              <span className="tres-petit texte-3" style={{ marginLeft: 6 }}>Épreuve {indexEpreuve + 1}/{epreuves.length}</span>
            </div>
          </div>
          <span className="badge chiffres" role="timer" style={{ fontSize: '1rem', padding: '7px 12px', background: urgent ? 'var(--erable-pale)' : 'var(--surface)', color: urgent ? 'var(--erreur)' : 'var(--texte)', border: '1px solid var(--bordure)' }}>
            <Icone nom="chrono" taille={16} /> {formatTemps(tempsAffiche)}
          </span>
          {!estOral && (
            <button className="btn btn-nuit btn-petit" onClick={terminerEpreuve}>{dernier ? 'Terminer' : 'Épreuve suivante'}</button>
          )}
        </div>
      </div>
    );

    // ——— Compréhension orale / écrite ———
    if (epActuelle.type === 'qcm') {
      const qs = questions[epActuelle.key] || [];
      if (!qs.length) return (
        <div>{barre}
          <div className="conteneur-etroit section"><div className="carte centre">
            <p style={{ marginBottom: 16 }}>Aucune question disponible pour cette épreuve pour le moment.</p>
            <button className="btn btn-nuit" onClick={terminerEpreuve}>Continuer</button>
          </div></div>
        </div>
      );
      const q = qs[indexQuestion];
      const repEpreuve = reponses[epActuelle.key] || {};
      const choisir = i => setReponses(prev => ({ ...prev, [epActuelle.key]: { ...(prev[epActuelle.key] || {}), [indexQuestion]: i } }));
      const estOrale = epActuelle.key === 'comprehension-orale';

      return (
        <div>
          {barre}
          <main className="conteneur" style={{ maxWidth: 900, padding: '20px 20px 48px' }}>
            <div className="ligne envelopper" style={{ gap: 5, marginBottom: 16 }}>
              {qs.map((qq, i) => {
                const repondu = repEpreuve[i] !== undefined;
                return (
                  <button key={i} onClick={() => setIndexQuestion(i)} title={`Question ${i + 1} · ${qq.niveau}`} aria-label={`Question ${i + 1}`}
                    style={{ width: 32, height: 32, borderRadius: 7, fontSize: '0.78rem', fontWeight: 700,
                      border: i === indexQuestion ? '2px solid var(--action)' : '1px solid var(--bordure)',
                      background: repondu ? 'var(--action-pale)' : 'var(--surface)', color: repondu ? 'var(--action)' : 'var(--texte-3)' }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="carte" style={{ marginBottom: 16 }}>
              <div className="ligne entre" style={{ marginBottom: 14 }}>
                <span className="petit texte-3 chiffres">Question {indexQuestion + 1} / {qs.length}</span>
                <span className="badge" style={{ color: NIVEAU_COULEUR[q.niveau] }}>Niveau {q.niveau}</span>
              </div>
              {estOrale ? (
                <div style={{ marginBottom: 16 }}>
                  {q.texte && <p className="etiquette" style={{ marginBottom: 8 }}>{q.texte}</p>}
                  {q.image && <div style={{ marginBottom: 12 }}><ImageDocument src={q.image} alt="Image de la question" /></div>}
                  <AudioPlayer key={q.id || indexQuestion} texte={q.audio_texte || q.texte} />
                </div>
              ) : q.image ? (
                <div style={{ marginBottom: 16 }}>
                  <p className="etiquette" style={{ marginBottom: 8 }}>Document · {q.texte}</p>
                  <ImageDocument key={q.id || indexQuestion} src={q.image} alt={q.texte} />
                </div>
              ) : (
                <div className="document" style={{ marginBottom: 16 }}>{q.texte}</div>
              )}
              <p className="gras" style={{ fontSize: '1.05rem', marginBottom: 14 }}>{q.question}</p>
              <div className="pile" style={{ gap: 10 }} role="radiogroup">
                {q.options.map((opt, i) => (
                  <button key={i} role="radio" aria-checked={repEpreuve[indexQuestion] === i} onClick={() => choisir(i)}
                    className={`choix${repEpreuve[indexQuestion] === i ? ' selectionne' : ''}`}>
                    <span className="choix-lettre">{String.fromCharCode(65 + i)}</span>{opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ligne gap-2">
              <button className="btn btn-contour" style={{ flex: 1 }} disabled={indexQuestion === 0} onClick={() => setIndexQuestion(i => Math.max(0, i - 1))}>
                <Icone nom="retour" taille={16} /> Précédente
              </button>
              <button className={`btn ${indexQuestion + 1 === qs.length ? 'btn-primaire' : 'btn-nuit'}`} style={{ flex: 1 }}
                onClick={() => (indexQuestion + 1 < qs.length ? setIndexQuestion(i => i + 1) : terminerEpreuve())}>
                {indexQuestion + 1 === qs.length ? (dernier ? 'Terminer l\'examen' : 'Épreuve suivante') : 'Suivante'} <Icone nom="fleche" taille={16} />
              </button>
            </div>
          </main>
        </div>
      );
    }

    // ——— Expression écrite : 3 tâches, 60 minutes au total ———
    if (epActuelle.type === 'redaction') {
      const sujet = sujetsEcrits[tacheEE];
      const nbMots = compterMots(redactions[tacheEE]);
      const okMots = nbMots >= sujet.minMots && nbMots <= sujet.maxMots;
      return (
        <div>
          {barre}
          <main className="conteneur" style={{ maxWidth: 900, padding: '20px 20px 48px' }}>
            <div className="segments" role="tablist" style={{ marginBottom: 16 }}>
              {TACHES_EE.map((t, i) => {
                const n = compterMots(redactions[i]);
                return (
                  <button key={t.numero} role="tab" aria-selected={i === tacheEE} className={`segment${i === tacheEE ? ' actif' : ''}`} onClick={() => setTacheEE(i)}>
                    Tâche {t.numero}
                    <span className="tres-petit" style={{ display: 'block', fontWeight: 500, color: n ? 'var(--succes)' : 'var(--texte-3)' }}>{n ? `${n} mots` : t.nom}</span>
                  </button>
                );
              })}
            </div>

            <div className="carte" style={{ marginBottom: 16 }}>
              <p className="etiquette" style={{ marginBottom: 6 }}>{sujet.tache} · {sujet.minMots} à {sujet.maxMots} mots</p>
              <p style={{ lineHeight: 1.7 }}>{sujet.sujet}</p>
              {sujet.documents && sujet.documents.map((d, i) => (
                <p key={i} className="document" style={{ marginTop: 10, borderLeft: '3px solid var(--ee)' }}>{d}</p>
              ))}
            </div>

            <div className="carte">
              <label htmlFor="redaction-examen" className="sr-only">Votre texte</label>
              <textarea id="redaction-examen" className="zone-texte" value={redactions[tacheEE]} placeholder="Rédigez votre texte ici…"
                onChange={e => { const v = e.target.value; setRedactions(prev => prev.map((r, i) => (i === tacheEE ? v : r))); }} />
              <div className="ligne entre envelopper gap-2" style={{ marginTop: 12 }}>
                <span className="petit gras chiffres" style={{ color: okMots ? 'var(--succes)' : nbMots > sujet.maxMots ? 'var(--erreur)' : 'var(--texte-3)' }}>
                  {nbMots} mot{nbMots > 1 ? 's' : ''} / {sujet.minMots}–{sujet.maxMots} {okMots ? '✓' : ''}
                </span>
                {tacheEE < 2
                  ? <button className="btn btn-nuit" onClick={() => setTacheEE(t => t + 1)}>Tâche suivante <Icone nom="fleche" taille={16} /></button>
                  : <button className="btn btn-primaire" onClick={terminerEpreuve}>{dernier ? 'Terminer l\'examen' : 'Épreuve suivante'} <Icone nom="fleche" taille={16} /></button>}
              </div>
            </div>
          </main>
        </div>
      );
    }

    // ——— Expression orale : 3 tâches chronométrées ———
    if (epActuelle.type === 'oral') {
      const sujet = sujetsOraux[tacheEO];
      const tache = TACHES_EO[tacheEO];
      return (
        <div>
          {barre}
          <main className="conteneur" style={{ maxWidth: 900, padding: '20px 20px 48px' }}>
            <div className="ligne gap-2" style={{ marginBottom: 16 }}>
              {TACHES_EO.map((t, i) => (
                <div key={t.numero} className="petit gras centre" style={{ flex: 1, padding: '9px 6px', borderRadius: 'var(--rayon-sm)',
                  border: i === tacheEO ? '2px solid var(--action)' : '1px solid var(--bordure)',
                  background: i < tacheEO ? 'var(--succes-pale)' : 'var(--surface)', color: i < tacheEO ? 'var(--succes)' : i === tacheEO ? 'var(--texte)' : 'var(--texte-3)' }}>
                  {i < tacheEO ? '✓ ' : ''}Tâche {t.numero}
                </div>
              ))}
            </div>

            <div className="carte" style={{ marginBottom: 16 }}>
              <p className="etiquette" style={{ marginBottom: 4 }}>{sujet.tache}</p>
              <p className="petit texte-3" style={{ marginBottom: 10 }}>{tache.description}</p>
              <p style={{ lineHeight: 1.7 }}>{sujet.sujet}</p>
            </div>

            {erreur && <div className="message-erreur" role="alert" style={{ marginBottom: 12 }}>{erreur}</div>}

            {phaseOrale === 'prep' && (
              <div className="carte centre" style={{ padding: 28 }}>
                {tache.preparationSecondes > 0 ? (
                  <>
                    <p className="etiquette" style={{ marginBottom: 6 }}>Préparation</p>
                    <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>{formatTemps(tempsOral)}</div>
                    <p className="petit texte-3" style={{ marginBottom: 18 }}>Notez vos questions. L'enregistrement démarrera automatiquement.</p>
                  </>
                ) : (
                  <>
                    <p className="titre-3" style={{ marginBottom: 6 }}>Pas de préparation pour cette tâche</p>
                    <p className="petit texte-3" style={{ marginBottom: 18 }}>Vous aurez {formatTemps(tache.dureeSecondes)} pour parler. Commencez quand vous êtes prêt(e).</p>
                  </>
                )}
                <button className="btn btn-primaire btn-grand btn-plein" onClick={demarrerEnregistrement}>
                  <Icone nom="micro" taille={18} /> {tache.preparationSecondes > 0 ? 'Je suis prêt(e), commencer' : 'Commencer l\'enregistrement'}
                </button>
              </div>
            )}

            {phaseOrale === 'enregistrement' && (
              <div className="carte centre" style={{ padding: 28 }}>
                <span className="badge" style={{ background: 'var(--erable-pale)', color: 'var(--erreur)', marginBottom: 10 }}>● Enregistrement</span>
                <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: 14 }}>{formatTemps(tempsOral)}</div>
                <div className="document" style={{ textAlign: 'left', marginBottom: 18, minHeight: 64 }}>
                  <p className="texte-2">{transcriptions[tacheEO] || 'Parlez, votre texte apparaîtra ici…'}</p>
                </div>
                <button className="btn btn-nuit btn-grand btn-plein" onClick={arreterEnregistrement}><Icone nom="coche" taille={18} /> J'ai terminé</button>
              </div>
            )}

            {phaseOrale === 'termine' && (
              <div className="carte">
                <p className="titre-3 ligne gap-1" style={{ marginBottom: 12, color: 'var(--succes)' }}><Icone nom="coche" taille={18} /> Tâche {tache.numero} terminée</p>
                {audios[tacheEO] && <audio controls src={audios[tacheEO]} style={{ width: '100%', marginBottom: 12 }} />}
                <div className="document" style={{ marginBottom: 16 }}>
                  <p className="etiquette" style={{ marginBottom: 6 }}>Transcription</p>
                  <p className="texte-2">{transcriptions[tacheEO] || 'Aucune transcription détectée (la reconnaissance vocale fonctionne dans Chrome et Edge).'}</p>
                </div>
                <button className="btn btn-primaire btn-grand btn-plein" onClick={tacheOraleSuivante}>
                  {tacheEO < 2 ? 'Tâche suivante' : dernier ? 'Terminer l\'examen' : 'Épreuve suivante'} <Icone nom="fleche" taille={18} />
                </button>
              </div>
            )}
          </main>
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
      <div>
        <EntetePage titre="Vos résultats estimés" sousTitre="Équivalences NCLC utilisées par IRCC, épreuve par épreuve." />
        <main className="conteneur chevauche" style={{ maxWidth: 820, paddingBottom: 56 }}>
          {nclcMin !== null && (
            <div className="carte centre" style={{ marginBottom: 16, padding: 'clamp(24px, 4vw, 36px)' }}>
              <p className="etiquette" style={{ marginBottom: 6 }}>Votre niveau le plus faible</p>
              <div style={{ fontFamily: 'var(--police-titre)', fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, color: nclcMin >= NCLC_CIBLE ? 'var(--succes)' : 'var(--alerte)' }}>{libelleNCLC(nclcMin)}</div>
              <p className="texte-2" style={{ marginTop: 10, maxWidth: 520, marginInline: 'auto' }}>
                {objectifAtteint
                  ? 'Vous atteignez NCLC 7 dans les 4 compétences, le minimum demandé par le Programme des travailleurs qualifiés (fédéral).'
                  : `Pour Entrée express, IRCC tient compte de chaque compétence séparément. Visez au moins NCLC ${NCLC_CIBLE} partout.`}
              </p>
            </div>
          )}

          <div className="carte" style={{ marginBottom: 16, padding: 0 }}>
            <h2 className="titre-3" style={{ padding: '18px 22px', borderBottom: '1px solid var(--bordure)' }}>Détail par épreuve</h2>
            {lignes.map(({ ep, r, nclc }, i) => {
              const cible = scorePourNCLC(ep.key, NCLC_CIBLE);
              return (
                <div key={ep.key} style={{ padding: '16px 22px', borderTop: i ? '1px solid var(--bordure)' : 'none' }}>
                  <div className="ligne gap-3">
                    <span className="pastille-icone" style={{ width: 40, height: 40, background: 'var(--surface-2)', color: ep.couleur }}><Icone nom={ICONE[ep.key]} taille={18} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="gras">{ep.label}</div>
                      <div className="petit texte-3">
                        {ep.type === 'qcm' && `${r.justes}/${r.total} bonnes réponses · niveau ${scoreVersCECR(r.score)}`}
                        {ep.type !== 'qcm' && r.mots && `Mots par tâche : ${r.mots.join(' · ')}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {r.score !== null && r.score !== undefined ? (
                        <>
                          <div className="chiffres gras" style={{ fontSize: '1.15rem' }}>{r.score}<span className="petit texte-3">/{r.max}</span></div>
                          <span className={`badge ${nclc >= NCLC_CIBLE ? 'badge-succes' : 'badge-alerte'}`}>{libelleNCLC(nclc)}</span>
                        </>
                      ) : (
                        <span className="badge badge-alerte">{estPro ? 'Correction indisponible' : 'Note avec Pro'}</span>
                      )}
                    </div>
                  </div>
                  {nclc !== null && nclc < NCLC_CIBLE && cible !== null && (
                    <p className="petit texte-2" style={{ marginTop: 8, marginLeft: 52 }}>
                      Il vous manque <strong>{cible - r.score} point{cible - r.score > 1 ? 's' : ''}</strong> pour atteindre NCLC {NCLC_CIBLE} ({cible}/{r.max}).
                    </p>
                  )}
                  {r.details && r.details.some(Boolean) && (
                    <div className="pile gap-1" style={{ marginTop: 8, marginLeft: 52 }}>
                      {r.details.map((d, t) => d && (
                        <p key={t} className="petit texte-2"><strong>Tâche {t + 1} : {d.note}/{d.note_max || 20}</strong>{d.conseils ? `. ${d.conseils}` : ''}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="tres-petit texte-3 centre" style={{ marginBottom: 16 }}>Estimation pédagogique : seul le TCF Canada officiel donne un résultat reconnu par IRCC.</p>
          <div className="ligne envelopper gap-2">
            <button className="btn btn-primaire btn-grand" style={{ flex: '1 1 200px' }} onClick={() => setPhase('intro')}>Repasser un examen</button>
            <button className="btn btn-contour btn-grand" style={{ flex: '1 1 200px' }} onClick={onRetour}>Tableau de bord</button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default Simulateur;
