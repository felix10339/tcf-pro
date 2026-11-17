import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config';
import AudioPlayer from './AudioPlayer';
import Icone from './Icone';
import { NIVEAU_COULEUR, scoreVersNCLC, libelleNCLC } from '../data/tcfCanada';

// Mini examen blanc de démonstration : les 4 épreuves du TCF Canada en version courte.
const QUESTIONS = [
  {
    section: 'comprehension-orale', niveau: 'A2', texte: 'Répondeur d\'une pharmacie',
    audio_texte: 'Bonjour, vous avez joint la pharmacie du Centre, rue Principale. Nous sommes ouverts de 9 h à 21 h en semaine, et de 10 h à 17 h la fin de semaine. Pour parler au pharmacien, faites le 1.',
    question: 'Que faut-il faire pour parler au pharmacien ?',
    options: ['Rappeler plus tard', 'Faire le 1', 'Faire le 9', 'Venir en personne'], correct: 1,
    explication: 'Le message dit : « Pour parler au pharmacien, faites le 1. »'
  },
  {
    section: 'comprehension-orale', niveau: 'B1', texte: 'Annonce dans un aéroport',
    audio_texte: 'Votre attention, s\'il vous plaît. Le vol 482 à destination de Vancouver est retardé d\'environ deux heures en raison des conditions météorologiques. Les passagers peuvent récupérer un bon de repas au comptoir de la porte 12.',
    question: 'Que peuvent obtenir les passagers ?',
    options: ['Un remboursement', 'Un bon pour manger', 'Une nuit d\'hôtel', 'Une place sur un autre vol'], correct: 1,
    explication: 'Ils peuvent récupérer « un bon de repas » à la porte 12.'
  },
  {
    section: 'comprehension-ecrite', niveau: 'A2',
    texte: 'Restaurant à Moncton cherche serveur ou serveuse bilingue (français-anglais). Temps partiel, soirs et fins de semaine. Expérience non requise, formation offerte.',
    question: 'Quelle condition est obligatoire pour ce poste ?',
    options: ['Avoir de l\'expérience', 'Travailler le matin', 'Parler français et anglais', 'Avoir un diplôme'], correct: 2,
    explication: 'Le poste est « bilingue (français-anglais) ». L\'expérience n\'est pas requise.'
  },
  {
    section: 'comprehension-ecrite', niveau: 'B1',
    texte: 'Bonjour à tous, à partir du lundi 6 janvier, l\'équipe passera en mode hybride : présence obligatoire au bureau le mardi et le jeudi, télétravail les autres jours. Les personnes qui souhaitent un autre horaire doivent en discuter avec leur gestionnaire avant le 20 décembre.',
    question: 'Combien de jours par semaine les employés devront-ils venir au bureau ?',
    options: ['Un jour', 'Trois jours', 'Deux jours', 'Cinq jours'], correct: 2,
    explication: 'La présence est obligatoire « le mardi et le jeudi », soit deux jours.'
  },
  {
    section: 'comprehension-ecrite', niveau: 'B2',
    texte: 'Les grandes épiceries canadiennes font face à des critiques croissantes au sujet du prix des aliments. Les chaînes affirment que la hausse s\'explique par les coûts de transport et les conditions climatiques, tandis que plusieurs économistes estiment que la faible concurrence dans le secteur leur permet de maintenir des marges élevées.',
    question: 'Sur quel point les économistes et les épiceries sont-ils en désaccord ?',
    options: ['Sur l\'existence de la hausse des prix', 'Sur les causes de la hausse des prix', 'Sur le nombre de chaînes au Canada', 'Sur la qualité des aliments'], correct: 1,
    explication: 'Tous reconnaissent la hausse, mais l\'expliquent différemment : coûts pour les épiceries, faible concurrence pour les économistes.'
  }
];

// Mêmes sujets que ceux imposés par le serveur (route /api/ia/demo/corriger)
const SUJET_EE = {
  tache: 'Tâche 1 — Message', minMots: 60, maxMots: 120,
  sujet: 'Vous venez d\'emménager dans un appartement à Montréal. Écrivez un message à vos nouveaux voisins pour vous présenter et les inviter à prendre un café chez vous samedi prochain.'
};
const SUJET_EO = {
  tache: 'Tâche 1 — Entretien dirigé', duree: 60,
  sujet: 'Présentez-vous : votre nom, votre pays d\'origine, votre travail ou vos études, vos loisirs et pourquoi vous souhaitez vivre au Canada.'
};

const ETAPES = [...QUESTIONS.map((q, i) => ({ type: 'qcm', i, section: q.section })), { type: 'ee', section: 'expression-ecrite' }, { type: 'eo', section: 'expression-orale' }];
const DUREE = 10 * 60;
const SECTION = {
  'comprehension-orale': { label: 'Compréhension orale', icone: 'casque', couleur: 'var(--co)' },
  'comprehension-ecrite': { label: 'Compréhension écrite', icone: 'livre', couleur: 'var(--ce)' },
  'expression-ecrite': { label: 'Expression écrite', icone: 'stylo', couleur: 'var(--ee)' },
  'expression-orale': { label: 'Expression orale', icone: 'micro', couleur: 'var(--eo)' }
};
const formatTemps = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const compterMots = t => t.trim().split(/\s+/).filter(Boolean).length;
const reconnaissanceDisponible = () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

// ——— Carte de correction IA ———
function CorrectionIA({ titre, section, resultat }) {
  const sec = SECTION[section];
  const entete = (
    <div className="ligne gap-2" style={{ marginBottom: 12 }}>
      <span style={{ color: sec.couleur, display: 'inline-flex' }}><Icone nom={sec.icone} taille={18} /></span>
      <span className="titre-3">{titre}</span>
      {resultat?.statut === 'ok' && <span className="badge badge-action" style={{ marginLeft: 'auto' }}><Icone nom="etincelle" taille={12} /> Corrigé par IA</span>}
    </div>
  );
  if (!resultat || resultat.statut !== 'ok') {
    return (
      <div className="carte" style={{ padding: 18 }}>
        {entete}
        <p className="petit texte-2">{resultat?.message || 'Non évalué.'}</p>
      </div>
    );
  }
  const c = resultat.donnees;
  const note = Math.round((Number(c.note) / (Number(c.note_max) || 20)) * 20);
  const nclc = scoreVersNCLC(section, note);
  return (
    <div className="carte" style={{ padding: 18 }}>
      {entete}
      <div className="ligne envelopper gap-3" style={{ marginBottom: 14 }}>
        <div>
          <span className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '1.9rem', fontWeight: 700 }}>{note}</span>
          <span className="texte-3">/20</span>
        </div>
        <span className={`badge ${nclc >= 7 ? 'badge-succes' : 'badge-alerte'}`}>{libelleNCLC(nclc)}</span>
        {c.niveau_estime && <span className="badge">Niveau estimé {c.niveau_estime}</span>}
      </div>

      {Array.isArray(c.criteres) && (
        <div className="grille grille-2" style={{ gap: 8, marginBottom: 14 }}>
          {c.criteres.map(cr => (
            <div key={cr.nom} className="petit" style={{ padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)' }}>
              <div className="ligne entre"><span className="texte-2">{cr.nom}</span><strong className="chiffres">{cr.note}/{cr.max}</strong></div>
            </div>
          ))}
        </div>
      )}

      <div className="grille grille-2" style={{ gap: 12, marginBottom: 12 }}>
        {[['Points forts', c.points_forts, 'var(--succes)'], ['À améliorer', c.points_ameliorer, 'var(--alerte)']].map(([t, liste, coul]) => Array.isArray(liste) && liste.length > 0 && (
          <div key={t}>
            <div className="tres-petit gras" style={{ color: coul, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{t}</div>
            <ul className="petit texte-2" style={{ paddingLeft: 18 }}>{liste.slice(0, 3).map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        ))}
      </div>

      {Array.isArray(c.erreurs) && c.erreurs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="tres-petit gras texte-3" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Corrections</div>
          {c.erreurs.slice(0, 3).map((e, i) => (
            <p key={i} className="petit" style={{ marginBottom: 4 }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--erreur)' }}>{e.texte}</span> → <strong style={{ color: 'var(--succes)' }}>{e.correction}</strong>
            </p>
          ))}
        </div>
      )}

      {c.conseils && (
        <p className="petit ligne gap-1" style={{ alignItems: 'flex-start', padding: 10, background: 'var(--action-pale)', borderRadius: 'var(--rayon-sm)' }}>
          <Icone nom="ampoule" taille={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--action)' }} /> {c.conseils}
        </p>
      )}
    </div>
  );
}

function DemoSimulateur({ onCommencer }) {
  const [phase, setPhase] = useState('intro'); // intro | examen | correction | resultat
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState({});
  const [temps, setTemps] = useState(DUREE);
  const [redaction, setRedaction] = useState('');
  const [corrections, setCorrections] = useState({});

  // Expression orale
  const [etatOral, setEtatOral] = useState('pret'); // pret | en_cours | fini
  const [tempsOral, setTempsOral] = useState(SUJET_EO.duree);
  const [transcription, setTranscription] = useState('');
  const [audioURL, setAudioURL] = useState(null);
  const [erreurMicro, setErreurMicro] = useState('');
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const actifRef = useRef(false);
  const debutOralRef = useRef(0);
  const dureeOralRef = useRef(0);
  const finRef = useRef(null);
  const arretRef = useRef(null);

  // Minuteur global de la démo
  useEffect(() => {
    if (phase !== 'examen') return;
    const id = setInterval(() => setTemps(t => {
      if (t <= 1) { clearInterval(id); finRef.current(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Compte à rebours de l'enregistrement oral
  useEffect(() => {
    if (etatOral !== 'en_cours') return;
    const id = setInterval(() => setTempsOral(t => {
      if (t <= 1) { clearInterval(id); arretRef.current(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [etatOral]);

  // Libérer le micro si le visiteur quitte la page pendant l'enregistrement
  useEffect(() => () => { actifRef.current = false; recognitionRef.current?.stop(); if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); }, []);

  const arreterOral = () => {
    if (!actifRef.current) return;
    actifRef.current = false;
    dureeOralRef.current = Math.round((Date.now() - debutOralRef.current) / 1000);
    recognitionRef.current?.stop();
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setEtatOral('fini');
  };
  arretRef.current = arreterOral;

  const demarrerOral = async () => {
    setErreurMicro('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const morceaux = [];
      recorder.ondataavailable = e => morceaux.push(e.data);
      recorder.onstop = () => { setAudioURL(URL.createObjectURL(new Blob(morceaux, { type: 'audio/webm' }))); stream.getTracks().forEach(t => t.stop()); };
      recorderRef.current = recorder;
      recorder.start();

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.lang = 'fr-CA'; rec.continuous = true; rec.interimResults = true;
        let stable = '';
        rec.onresult = e => {
          let provisoire = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) stable += e.results[i][0].transcript + ' ';
            else provisoire += e.results[i][0].transcript;
          }
          setTranscription(stable + provisoire);
        };
        rec.onend = () => { if (actifRef.current) { try { rec.start(); } catch { /* déjà relancée */ } } };
        recognitionRef.current = rec;
        rec.start();
      }
      actifRef.current = true;
      debutOralRef.current = Date.now();
      setTranscription(''); setAudioURL(null); setTempsOral(SUJET_EO.duree);
      setEtatOral('en_cours');
    } catch {
      setErreurMicro('Micro inaccessible. Autorisez le micro dans votre navigateur, ou écrivez ci-dessous ce que vous diriez.');
    }
  };

  const corriger = async (type, texte, extra = {}) => {
    try {
      const res = await axios.post(`${API_URL}/api/ia/demo/corriger`, { type, texte, ...extra });
      return { statut: 'ok', donnees: res.data };
    } catch (err) {
      return { statut: 'erreur', message: err.response?.data?.message || 'Impossible de joindre le serveur de correction.' };
    }
  };

  const terminer = async () => {
    arreterOral();
    window.speechSynthesis?.cancel();
    setPhase('correction');
    const motsEE = compterMots(redaction);
    const motsEO = compterMots(transcription);
    const [ee, eo] = await Promise.all([
      motsEE >= 20 ? corriger('ecrit', redaction) : Promise.resolve({ statut: 'vide', message: 'Non évalué : écrivez au moins 20 mots pour obtenir une correction.' }),
      motsEO >= 10 ? corriger('oral', transcription, { dureeEnregistree: dureeOralRef.current || SUJET_EO.duree }) : Promise.resolve({ statut: 'vide', message: 'Non évalué : parlez (ou écrivez) au moins 10 mots pour obtenir une correction.' })
    ]);
    setCorrections({ ee, eo });
    setPhase('resultat');
  };
  finRef.current = terminer;

  const demarrer = () => {
    setReponses({}); setIndex(0); setTemps(DUREE); setRedaction(''); setTranscription(''); setAudioURL(null);
    setEtatOral('pret'); setTempsOral(SUJET_EO.duree); setCorrections({}); setErreurMicro('');
    setPhase('examen');
  };
  const nbJustes = QUESTIONS.filter((q, i) => reponses[i] === q.correct).length;
  const cadre = { padding: 0, overflow: 'hidden', boxShadow: 'var(--ombre-3)' };
  const etapeFaite = i => {
    const e = ETAPES[i];
    if (e.type === 'qcm') return reponses[e.i] !== undefined;
    if (e.type === 'ee') return compterMots(redaction) > 0;
    return compterMots(transcription) > 0;
  };

  // ═══ Accueil de la démo ═══
  if (phase === 'intro') return (
    <div className="carte" style={cadre}>
      <div className="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 0 }}>
        <div style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
          <span className="badge badge-action" style={{ marginBottom: 14 }}><Icone nom="chrono" taille={13} /> 10 minutes · sans inscription</span>
          <h3 className="titre-2" style={{ marginBottom: 10 }}>Mini examen blanc</h3>
          <p className="texte-2" style={{ marginBottom: 20 }}>
            Les 4 épreuves du TCF Canada en version courte, dans l'interface du vrai simulateur. Votre production écrite et orale est <strong>corrigée par l'IA</strong>, avec une note sur 20 et votre NCLC.
          </p>
          <button className="btn btn-primaire btn-grand" onClick={demarrer}>Lancer la démo <Icone nom="fleche" taille={18} /></button>
          <p className="tres-petit texte-3" style={{ marginTop: 12 }}>Activez le son et autorisez le micro pour l'expression orale.</p>
        </div>
        <div style={{ background: 'var(--surface-2)', padding: 'clamp(24px, 4vw, 36px)', borderLeft: '1px solid var(--bordure)' }}>
          <div className="tres-petit gras texte-3" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Au programme</div>
          <ul className="pile gap-2" style={{ listStyle: 'none' }}>
            {[
              ['comprehension-orale', '2 questions d\'écoute'],
              ['comprehension-ecrite', '3 questions de lecture'],
              ['expression-ecrite', 'Un message de 60 à 120 mots'],
              ['expression-orale', '1 minute pour vous présenter']
            ].map(([s, detail]) => (
              <li key={s} className="ligne gap-2 petit">
                <span className="pastille-icone" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', color: SECTION[s].couleur }}>
                  <Icone nom={SECTION[s].icone} taille={16} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="gras">{SECTION[s].label}</div>
                  <div className="tres-petit texte-3">{detail}</div>
                </div>
                {s.startsWith('expression') && <span className="badge" style={{ background: 'var(--surface)' }}><Icone nom="etincelle" taille={11} /> IA</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  // ═══ Correction en cours ═══
  if (phase === 'correction') return (
    <div className="carte centre" style={{ ...cadre, padding: 48 }}>
      <div className="chargeur" style={{ margin: '0 auto 16px' }} />
      <p className="titre-3" style={{ marginBottom: 4 }}>L'IA corrige vos productions…</p>
      <p className="petit texte-3">Environ 10 secondes.</p>
    </div>
  );

  // ═══ Examen en cours ═══
  if (phase === 'examen') {
    const etape = ETAPES[index];
    const sec = SECTION[etape.section];
    const dernier = index === ETAPES.length - 1;
    let contenu;

    if (etape.type === 'qcm') {
      const q = QUESTIONS[etape.i];
      contenu = (
        <>
          {q.section === 'comprehension-orale' ? (
            <div style={{ marginBottom: 16 }}>
              <p className="petit texte-3" style={{ marginBottom: 8 }}>{q.texte}</p>
              <AudioPlayer key={index} texte={q.audio_texte} />
            </div>
          ) : (
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)', padding: 16, marginBottom: 16, lineHeight: 1.7 }}>{q.texte}</div>
          )}
          <p className="gras" style={{ marginBottom: 12 }}>{q.question}</p>
          <div className="pile" style={{ gap: 8, marginBottom: 18 }} role="radiogroup">
            {q.options.map((opt, i) => {
              const choisi = reponses[etape.i] === i;
              return (
                <button key={i} role="radio" aria-checked={choisi} onClick={() => setReponses(r => ({ ...r, [etape.i]: i }))} className="ligne gap-2"
                  style={{ textAlign: 'left', padding: '11px 14px', borderRadius: 'var(--rayon-sm)', fontSize: '0.95rem',
                    border: `1.5px solid ${choisi ? 'var(--action)' : 'var(--bordure)'}`, background: choisi ? 'var(--action-pale)' : 'var(--surface)' }}>
                  <span className="gras" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                    background: choisi ? 'var(--action)' : 'var(--surface-2)', color: choisi ? '#fff' : 'var(--texte-2)' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      );
    } else if (etape.type === 'ee') {
      const mots = compterMots(redaction);
      const ok = mots >= SUJET_EE.minMots && mots <= SUJET_EE.maxMots;
      contenu = (
        <>
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)', padding: 16, marginBottom: 14 }}>
            <div className="tres-petit gras texte-3" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{SUJET_EE.tache}</div>
            <p style={{ lineHeight: 1.7 }}>{SUJET_EE.sujet}</p>
          </div>
          <textarea className="champ" value={redaction} onChange={e => setRedaction(e.target.value.slice(0, 1500))} rows={8}
            placeholder="Bonjour à tous, je m'appelle…" aria-label="Votre message"
            style={{ resize: 'vertical', lineHeight: 1.7, marginBottom: 8 }} />
          <div className="ligne entre petit" style={{ marginBottom: 18 }}>
            <span className="gras chiffres" style={{ color: ok ? 'var(--succes)' : mots > SUJET_EE.maxMots ? 'var(--erreur)' : 'var(--texte-3)' }}>
              {mots} mot{mots > 1 ? 's' : ''} / {SUJET_EE.minMots}–{SUJET_EE.maxMots}
            </span>
            <span className="texte-3 ligne gap-1"><Icone nom="etincelle" taille={14} /> Corrigé par IA à la fin</span>
          </div>
        </>
      );
    } else {
      const sansReco = !reconnaissanceDisponible();
      contenu = (
        <>
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)', padding: 16, marginBottom: 14 }}>
            <div className="tres-petit gras texte-3" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{SUJET_EO.tache} · 1 minute</div>
            <p style={{ lineHeight: 1.7 }}>{SUJET_EO.sujet}</p>
          </div>

          <div className="ligne gap-3 envelopper" style={{ padding: 16, borderRadius: 'var(--rayon)', background: 'var(--nuit)', color: '#fff', marginBottom: 12 }}>
            {etatOral === 'en_cours' ? (
              <button className="btn btn-clair" onClick={arreterOral}><Icone nom="coche" taille={16} /> J'ai terminé</button>
            ) : (
              <button className="btn btn-primaire" onClick={demarrerOral}><Icone nom="micro" taille={16} /> {etatOral === 'fini' ? 'Recommencer' : 'Commencer à parler'}</button>
            )}
            <div className="petit" style={{ flex: 1, minWidth: 160 }}>
              {etatOral === 'en_cours' && <><strong style={{ color: '#FCA5A5' }}>● Enregistrement</strong> · {formatTemps(tempsOral)} restantes</>}
              {etatOral === 'pret' && <span style={{ opacity: 0.75 }}>Vous aurez 1 minute. Parlez naturellement.</span>}
              {etatOral === 'fini' && <span style={{ opacity: 0.85 }}>Enregistrement terminé ({dureeOralRef.current} s).</span>}
            </div>
          </div>
          {audioURL && <audio controls src={audioURL} style={{ width: '100%', marginBottom: 12 }} />}
          {erreurMicro && <div className="message-erreur" style={{ marginBottom: 12 }}>{erreurMicro}</div>}

          {(transcription || sansReco || erreurMicro) && (
            <div className="champ-groupe" style={{ marginBottom: 18 }}>
              <label className="champ-label" htmlFor="transcription">
                {sansReco || erreurMicro ? 'Votre réponse (écrivez ce que vous diriez à l\'oral)' : 'Transcription de votre réponse'}
              </label>
              <textarea id="transcription" className="champ" rows={4} value={transcription}
                readOnly={!(sansReco || erreurMicro)} onChange={e => setTranscription(e.target.value.slice(0, 1500))}
                style={{ resize: 'vertical', background: sansReco || erreurMicro ? 'var(--surface)' : 'var(--surface-2)' }} />
              {sansReco && !erreurMicro && <span className="tres-petit texte-3">La transcription automatique fonctionne dans Chrome et Edge.</span>}
            </div>
          )}
        </>
      );
    }

    return (
      <div className="carte" style={cadre}>
        <div className="ligne entre gap-2" style={{ padding: '12px 18px', borderBottom: '1px solid var(--bordure)' }}>
          <div className="ligne gap-2" style={{ minWidth: 0 }}>
            <span style={{ color: sec.couleur, display: 'inline-flex' }}><Icone nom={sec.icone} taille={18} /></span>
            <span className="petit gras" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sec.label}</span>
          </div>
          <span className="chiffres gras ligne gap-1" style={{ color: temps < 60 ? 'var(--erreur)' : 'var(--texte)' }}>
            <Icone nom="chrono" taille={16} /> {formatTemps(temps)}
          </span>
        </div>
        <div className="progression" style={{ borderRadius: 0, height: 3 }}>
          <div style={{ width: `${((index + 1) / ETAPES.length) * 100}%`, background: 'var(--action)', borderRadius: 0 }} />
        </div>

        <div style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
          <div className="ligne entre envelopper gap-2" style={{ marginBottom: 16 }}>
            <div className="ligne gap-1 envelopper">
              {ETAPES.map((e, i) => (
                <button key={i} onClick={() => { arreterOral(); setIndex(i); }} aria-label={`Étape ${i + 1} : ${SECTION[e.section].label}`}
                  style={{ width: 30, height: 30, borderRadius: 7, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: i === index ? '2px solid var(--action)' : '1px solid var(--bordure)',
                    background: etapeFaite(i) ? 'var(--action-pale)' : 'var(--surface)',
                    color: etapeFaite(i) ? 'var(--action)' : 'var(--texte-3)' }}>
                  {e.type === 'qcm' ? i + 1 : <Icone nom={SECTION[e.section].icone} taille={14} />}
                </button>
              ))}
            </div>
            {etape.type === 'qcm'
              ? <span className="badge" style={{ color: NIVEAU_COULEUR[QUESTIONS[etape.i].niveau] }}>Niveau {QUESTIONS[etape.i].niveau}</span>
              : <span className="badge badge-action"><Icone nom="etincelle" taille={12} /> Correction IA</span>}
          </div>

          {contenu}

          <div className="ligne gap-2">
            <button className="btn btn-contour" disabled={index === 0} onClick={() => { arreterOral(); setIndex(i => i - 1); }} style={{ flex: 1 }}>
              <Icone nom="retour" taille={16} /> Précédente
            </button>
            <button className={`btn ${dernier ? 'btn-primaire' : 'btn-nuit'}`} disabled={etatOral === 'en_cours' && dernier}
              onClick={() => (dernier ? terminer() : setIndex(i => i + 1))} style={{ flex: 1 }}>
              {dernier ? 'Terminer et corriger' : 'Suivante'} <Icone nom={dernier ? 'etincelle' : 'fleche'} taille={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ Résultat ═══
  return (
    <div className="carte" style={cadre}>
      <div className="ligne entre envelopper gap-3" style={{ padding: 'clamp(20px, 3vw, 28px)', background: 'var(--nuit)', color: '#fff' }}>
        <div>
          <div className="petit" style={{ opacity: 0.7 }}>Compréhension (écoute et lecture)</div>
          <div style={{ fontFamily: 'var(--police-titre)', fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.1 }}>{nbJustes} / {QUESTIONS.length}</div>
        </div>
        <p className="petit" style={{ maxWidth: 360, opacity: 0.85 }}>
          Voici votre aperçu sur les 4 épreuves. L'examen complet compte 39 questions par épreuve de compréhension et 3 tâches par épreuve d'expression.
        </p>
      </div>

      <div style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
        <div className="grille grille-2" style={{ gap: 14, marginBottom: 24, alignItems: 'start' }}>
          <CorrectionIA titre="Expression écrite" section="expression-ecrite" resultat={corrections.ee} />
          <CorrectionIA titre="Expression orale" section="expression-orale" resultat={corrections.eo} />
        </div>

        <h4 className="titre-3" style={{ marginBottom: 12 }}>Corrections de la compréhension</h4>
        <ol className="pile gap-2" style={{ listStyle: 'none', marginBottom: 24 }}>
          {QUESTIONS.map((q, i) => {
            const juste = reponses[i] === q.correct;
            return (
              <li key={i} className="ligne gap-2" style={{ alignItems: 'flex-start', padding: 12, borderRadius: 'var(--rayon-sm)', background: juste ? 'var(--succes-pale)' : 'var(--surface-2)' }}>
                <span className="pastille-icone" style={{ width: 26, height: 26, borderRadius: '50%', background: juste ? 'var(--succes)' : 'var(--erreur)', color: '#fff' }}>
                  <Icone nom={juste ? 'coche' : 'croix'} taille={14} epaisseur={3} />
                </span>
                <div className="petit">
                  <div className="gras" style={{ marginBottom: 2 }}>{q.question} <span className="texte-3" style={{ fontWeight: 500 }}>· {q.niveau}</span></div>
                  {!juste && <div style={{ marginBottom: 2 }}>Bonne réponse : <strong>{q.options[q.correct]}</strong>{reponses[i] === undefined ? ' (sans réponse)' : ''}</div>}
                  <div className="texte-2">{q.explication}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="ligne envelopper gap-2">
          <button className="btn btn-primaire btn-grand" onClick={onCommencer} style={{ flex: '1 1 220px' }}>Passer l'examen complet <Icone nom="fleche" taille={18} /></button>
          <button className="btn btn-contour btn-grand" onClick={demarrer} style={{ flex: '0 1 auto' }}>Recommencer</button>
        </div>
        <p className="tres-petit texte-3" style={{ marginTop: 10 }}>La correction IA de la démo est limitée à une par épreuve et par visiteur. Estimation pédagogique, non officielle.</p>
      </div>
    </div>
  );
}

export default DemoSimulateur;
