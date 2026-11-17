import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import sujets from '../data/sujets-expression-orale';
import API_URL from '../config';
import { NIVEAU_COULEUR } from '../data/tcfCanada';
import EntetePage from '../components/EntetePage';
import CarteCorrection from '../components/CarteCorrection';
import Icone from '../components/Icone';

// Préparation : 2 min pour la tâche 2 (comme à l'examen) ; 30 s d'échauffement pour les autres tâches en mode entraînement.
const dureePreparation = sujet => sujet.preparation || 30;
const formatTemps = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const compterMots = t => t.trim().split(/\s+/).filter(Boolean).length;
const NOM_TACHE = { 1: 'Entretien dirigé', 2: 'Exercice en interaction', 3: 'Expression d\'un point de vue' };

function ExpressionOrale({ onRetour }) {
  // choix → preparation → enregistrement → verification → correction
  const [phase, setPhase] = useState('choix');
  const [sujetChoisi, setSujetChoisi] = useState(null);
  const [tempsPrep, setTempsPrep] = useState(30);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [audioURL, setAudioURL] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [correction, setCorrection] = useState(null);
  const [erreur, setErreur] = useState('');

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const actifRef = useRef(false);

  // Libère le micro si l'utilisateur quitte la page en cours d'enregistrement
  useEffect(() => () => {
    actifRef.current = false;
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  }, []);

  const arreterEnregistrement = () => {
    if (!actifRef.current) return;
    actifRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    recognitionRef.current?.stop();
    setPhase('verification');
  };

  const demarrerEnregistrement = async () => {
    setErreur('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const morceaux = [];
      recorder.ondataavailable = e => morceaux.push(e.data);
      recorder.onstop = () => {
        setAudioURL(URL.createObjectURL(new Blob(morceaux, { type: 'audio/webm' })));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recognition = new SR();
        recognition.lang = 'fr-CA';
        recognition.continuous = true;
        recognition.interimResults = true;
        let texteStable = '';
        recognition.onresult = e => {
          let provisoire = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) texteStable += e.results[i][0].transcript + ' ';
            else provisoire += e.results[i][0].transcript;
          }
          setTranscription(texteStable + provisoire);
        };
        // Chrome coupe parfois la reconnaissance après un silence : on la relance tant que l'enregistrement continue
        recognition.onend = () => { if (actifRef.current) { try { recognition.start(); } catch { /* déjà relancée */ } } };
        recognitionRef.current = recognition;
        recognition.start();
      }

      actifRef.current = true;
      setTranscription('');
      setAudioURL(null);
      setTempsEcoule(0);
      setPhase('enregistrement');
    } catch {
      // Micro refusé : on passe directement à la saisie manuelle
      setErreur('Micro inaccessible. Autorisez le micro dans votre navigateur, ou écrivez ci-dessous ce que vous diriez.');
      setPhase('verification');
    }
  };

  // Références à jour pour les minuteurs
  const demarrerRef = useRef(demarrerEnregistrement);
  demarrerRef.current = demarrerEnregistrement;
  const arreterRef = useRef(arreterEnregistrement);
  arreterRef.current = arreterEnregistrement;

  // Compte à rebours de préparation, puis démarrage automatique
  useEffect(() => {
    if (phase !== 'preparation') return;
    const id = setInterval(() => setTempsPrep(t => {
      if (t <= 1) { clearInterval(id); demarrerRef.current(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Chronomètre de l'enregistrement, arrêt automatique à la durée cible
  useEffect(() => {
    if (phase !== 'enregistrement' || !sujetChoisi) return;
    const id = setInterval(() => setTempsEcoule(t => {
      if (t + 1 >= sujetChoisi.duree) { clearInterval(id); arreterRef.current(); }
      return t + 1;
    }), 1000);
    return () => clearInterval(id);
  }, [phase, sujetChoisi]);

  const choisirSujet = sujet => {
    setSujetChoisi(sujet);
    setTempsPrep(dureePreparation(sujet));
    setTranscription(''); setAudioURL(null); setCorrection(null); setErreur('');
    setPhase('preparation');
    window.scrollTo(0, 0);
  };

  const soumettrePourCorrection = async () => {
    if (compterMots(transcription) < 10) {
      setErreur('La transcription est trop courte (au moins 10 mots). Vérifiez votre micro ou complétez-la à la main.');
      return;
    }
    setChargement(true);
    setErreur('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/ia/corriger-oral`, {
        tache: sujetChoisi.tache,
        sujet: sujetChoisi.sujet,
        transcription,
        niveau: sujetChoisi.niveau,
        dureeEnregistree: tempsEcoule,
        dureeAttandue: sujetChoisi.duree
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCorrection(res.data);
      setPhase('correction');
      window.scrollTo(0, 0);
    } catch (err) {
      setErreur(err.response?.data?.message || 'La correction n\'a pas pu être effectuée. Réessayez dans quelques instants.');
    } finally {
      setChargement(false);
    }
  };

  const recommencer = () => { setPhase('choix'); setTranscription(''); setAudioURL(null); setCorrection(null); setTempsEcoule(0); setErreur(''); };

  // ——— Choix du sujet ———
  if (phase === 'choix') return (
    <div>
      <EntetePage titre="Expression orale" sousTitre="Choisissez une tâche du TCF Canada, parlez au micro : l'IA transcrit, note votre production sur 20 et vous donne votre équivalence NCLC." onRetour={onRetour} />
      <main className="conteneur chevauche" style={{ maxWidth: 960, paddingBottom: 56 }}>
        <div className="encadre encadre-info carte" style={{ marginBottom: 24, border: 'none' }}>
          <Icone nom="micro" taille={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--action)' }} />
          <p><strong>Comment ça marche :</strong> préparation, puis enregistrement chronométré, vérification de la transcription et correction par l'IA. La transcription automatique fonctionne dans Chrome et Edge.</p>
        </div>
        {[1, 2, 3].map(n => (
          <section key={n} style={{ marginBottom: 28 }}>
            <h2 className="titre-3" style={{ marginBottom: 12 }}>Tâche {n} · {NOM_TACHE[n]}</h2>
            <div className="grille grille-2">
              {sujets.filter(s => s.numeroTache === n).map(s => (
                <button key={s.id} className="carte carte-cliquable pile" style={{ gap: 10 }} onClick={() => choisirSujet(s)}>
                  <div className="ligne entre">
                    <span className="badge"><Icone nom="chrono" taille={12} /> {formatTemps(s.duree)}{s.preparation ? ` · ${s.preparation / 60} min de préparation` : ''}</span>
                    <span className="badge" style={{ color: NIVEAU_COULEUR[s.niveau] }}>{s.niveau}</span>
                  </div>
                  <p className="texte-2" style={{ lineHeight: 1.6 }}>{s.sujet}</p>
                  <span className="ligne gap-1 petit gras" style={{ color: 'var(--action)', marginTop: 'auto' }}>Commencer <Icone nom="fleche" taille={14} /></span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );

  // ——— Préparation ———
  if (phase === 'preparation') {
    const total = dureePreparation(sujetChoisi);
    return (
      <div>
        <EntetePage surTitre={`${sujetChoisi.tache} · Niveau ${sujetChoisi.niveau}`} titre="Préparez votre réponse" onRetour={recommencer} libelleRetour="Changer de sujet" />
        <main className="conteneur chevauche" style={{ maxWidth: 720, paddingBottom: 56 }}>
          <div className="carte centre" style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
            <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '4rem', fontWeight: 700, lineHeight: 1, color: tempsPrep <= 10 ? 'var(--erreur)' : 'var(--nuit)' }}>{formatTemps(tempsPrep)}</div>
            <p className="petit texte-3" style={{ margin: '6px 0 16px' }}>L'enregistrement démarrera automatiquement</p>
            <div className="progression" style={{ marginBottom: 24 }}>
              <div style={{ width: `${(tempsPrep / total) * 100}%`, background: tempsPrep <= 10 ? 'var(--erreur)' : 'var(--action)', transition: 'width 1s linear' }} />
            </div>
            <div className="document" style={{ textAlign: 'left', marginBottom: 16 }}>
              <p className="etiquette" style={{ marginBottom: 6 }}>Sujet</p>
              <p style={{ marginBottom: 12 }}>{sujetChoisi.sujet}</p>
              <ul className="pile gap-1" style={{ listStyle: 'none' }}>
                {sujetChoisi.conseils.map((c, i) => <li key={i} className="ligne gap-1 petit texte-2" style={{ alignItems: 'flex-start' }}><Icone nom="ampoule" taille={14} style={{ flexShrink: 0, marginTop: 3 }} />{c}</li>)}
              </ul>
            </div>
            <button className="btn btn-primaire btn-grand btn-plein" onClick={demarrerEnregistrement}><Icone nom="micro" taille={18} /> Je suis prêt(e), commencer</button>
          </div>
        </main>
      </div>
    );
  }

  // ——— Enregistrement ———
  if (phase === 'enregistrement') {
    const restant = Math.max(0, sujetChoisi.duree - tempsEcoule);
    return (
      <div>
        <EntetePage surTitre={`${sujetChoisi.tache} · Niveau ${sujetChoisi.niveau}`} titre="Enregistrement en cours" />
        <main className="conteneur chevauche" style={{ maxWidth: 720, paddingBottom: 56 }}>
          <div className="carte centre" style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
            <span className="badge" style={{ background: 'var(--erable-pale)', color: 'var(--erreur)', marginBottom: 12 }}>● Enregistrement</span>
            <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>{formatTemps(restant)}</div>
            <p className="petit texte-3" style={{ margin: '6px 0 16px' }}>temps restant</p>
            <div className="progression" style={{ marginBottom: 20 }}>
              <div style={{ width: `${(tempsEcoule / sujetChoisi.duree) * 100}%`, background: 'var(--eo)', transition: 'width 1s linear' }} />
            </div>
            <div className="document" style={{ textAlign: 'left', marginBottom: 20, minHeight: 80 }}>
              <p className="etiquette" style={{ marginBottom: 6 }}>Transcription en direct</p>
              <p className="texte-2">{transcription || 'Parlez, votre texte apparaîtra ici…'}</p>
            </div>
            <button className="btn btn-nuit btn-grand btn-plein" onClick={arreterEnregistrement}><Icone nom="coche" taille={18} /> J'ai terminé</button>
          </div>
        </main>
      </div>
    );
  }

  // ——— Vérification avant correction ———
  if (phase === 'verification') {
    const mots = compterMots(transcription);
    return (
      <div>
        <EntetePage surTitre={sujetChoisi.tache} titre="Vérifiez votre réponse" sousTitre="Réécoutez-vous et corrigez la transcription si la reconnaissance vocale s'est trompée." />
        <main className="conteneur chevauche" style={{ maxWidth: 820, paddingBottom: 56 }}>
          <div className="grille grille-3" style={{ marginBottom: 16 }}>
            {[[formatTemps(tempsEcoule), 'Durée enregistrée'], [formatTemps(sujetChoisi.duree), 'Durée visée'], [mots, 'Mots transcrits']].map(([val, label]) => (
              <div key={label} className="carte centre" style={{ padding: 16 }}>
                <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '1.6rem', fontWeight: 700 }}>{val}</div>
                <div className="petit texte-3">{label}</div>
              </div>
            ))}
          </div>

          {audioURL && (
            <div className="carte" style={{ marginBottom: 16 }}>
              <p className="titre-3" style={{ marginBottom: 10 }}>Réécouter votre enregistrement</p>
              <audio controls src={audioURL} style={{ width: '100%' }} />
            </div>
          )}

          <div className="carte" style={{ marginBottom: 16 }}>
            <label htmlFor="transcription" className="titre-3" style={{ display: 'block', marginBottom: 10 }}>
              {transcription ? 'Transcription automatique' : 'Votre réponse'}
            </label>
            <textarea id="transcription" className="zone-texte" style={{ minHeight: 160 }} value={transcription} onChange={e => setTranscription(e.target.value)}
              placeholder="Aucune transcription détectée. Écrivez ici ce que vous avez dit…" />
          </div>

          {erreur && <div className="message-erreur" role="alert" style={{ marginBottom: 12 }}>{erreur}</div>}
          <div className="ligne envelopper gap-2">
            <button className="btn btn-contour btn-grand" style={{ flex: '1 1 160px' }} onClick={() => choisirSujet(sujetChoisi)}>Recommencer l'enregistrement</button>
            <button className="btn btn-primaire btn-grand" style={{ flex: '2 1 240px' }} onClick={soumettrePourCorrection} disabled={chargement || mots < 10}>
              {chargement ? 'Correction en cours…' : <><Icone nom="etincelle" taille={18} /> Faire corriger par l'IA</>}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ——— Correction ———
  if (phase === 'correction' && correction) return (
    <div>
      <EntetePage surTitre={sujetChoisi.tache} titre="Votre correction" onRetour={onRetour} />
      <main className="conteneur chevauche" style={{ maxWidth: 820, paddingBottom: 56 }}>
        <CarteCorrection correction={correction} section="expression-orale" />
        <div className="ligne envelopper gap-2" style={{ marginTop: 20 }}>
          <button className="btn btn-primaire" style={{ flex: '1 1 160px' }} onClick={() => choisirSujet(sujetChoisi)}>Refaire ce sujet</button>
          <button className="btn btn-contour" style={{ flex: '1 1 160px' }} onClick={recommencer}>Autre sujet</button>
          <button className="btn btn-contour" style={{ flex: '1 1 160px' }} onClick={onRetour}>Tableau de bord</button>
        </div>
      </main>
    </div>
  );

  return null;
}

export default ExpressionOrale;
