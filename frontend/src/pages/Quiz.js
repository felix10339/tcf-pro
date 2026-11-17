import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Question from '../components/Question';
import Timer from '../components/Timer';
import Icone from '../components/Icone';
import API_URL from '../config';

const SECTIONS = {
  'comprehension-ecrite': { label: 'Compréhension écrite', icone: 'livre', couleur: 'var(--ce)' },
  'comprehension-orale': { label: 'Compréhension orale', icone: 'casque', couleur: 'var(--co)' }
};

function Quiz({ section, utilisateur, onRetourDashboard }) {
  const [questions, setQuestions] = useState([]);
  const [indexActuel, setIndexActuel] = useState(0);
  const [reponseSelectionnee, setReponseSelectionnee] = useState(null);
  const [valide, setValide] = useState(false);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [cle, setCle] = useState(0);
  const [explicationIA, setExplicationIA] = useState('');
  const [chargementIA, setChargementIA] = useState(false);
  const [erreurChargement, setErreurChargement] = useState(false);

  const infos = SECTIONS[section] || { label: 'Entraînement', icone: 'livre', couleur: 'var(--nuit)' };
  const estPro = utilisateur?.abonnement === 'pro';

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(API_URL + '/api/questions/section/' + section, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => setQuestions(res.data))
      .catch(err => { console.error(err); setErreurChargement(true); });
  }, [section]);

  const sauvegarderStats = useCallback((bonnesReponses, totalQuestions) => {
    const key = 'stats-' + utilisateur.id;
    const savedStats = localStorage.getItem(key);
    const stats = savedStats ? JSON.parse(savedStats) : {
      totalQuestions: 0,
      bonnesReponses: 0,
      mauvaisesReponses: 0,
      sections: {
        'comprehension-ecrite': { total: 0, bonnes: 0 },
        'comprehension-orale': { total: 0, bonnes: 0 },
        'expression-ecrite': { total: 0, bonnes: 0 },
        'expression-orale': { total: 0, bonnes: 0 }
      }
    };

    stats.totalQuestions += totalQuestions;
    stats.bonnesReponses += bonnesReponses;
    stats.mauvaisesReponses += (totalQuestions - bonnesReponses);
    if (stats.sections[section]) {
      stats.sections[section].total += totalQuestions;
      stats.sections[section].bonnes += bonnesReponses;
    }
    localStorage.setItem(key, JSON.stringify(stats));
  }, [utilisateur.id, section]);

  const questionSuivante = useCallback(() => {
    if (indexActuel + 1 >= questions.length) {
      setTermine(true);
      sauvegarderStats(score, questions.length);
    } else {
      setIndexActuel(i => i + 1);
      setReponseSelectionnee(null);
      setValide(false);
      setExplicationIA('');
      setCle(k => k + 1);
    }
  }, [indexActuel, questions.length, score, sauvegarderStats]);

  const validerReponse = useCallback(async () => {
    if (reponseSelectionnee === null || valide) return;
    setValide(true);
    setChargementIA(true);

    if (reponseSelectionnee === questions[indexActuel].correct) {
      setScore(s => s + 1);
    }

    try {
      const q = questions[indexActuel];
      const token = localStorage.getItem('token');

      const res = await axios.post(
        API_URL + '/api/ia/expliquer',
        {
          question: q.question,
          reponseUtilisateur: reponseSelectionnee,
          bonneReponse: q.correct,
          optionChoisie: q.options[reponseSelectionnee],
          bonneOption: q.options[q.correct]
        },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      // Sans abonnement Pro, l'explication détaillée enregistrée avec la question est plus utile que le message générique.
      setExplicationIA(res.data.limiteGratuit ? (q.explication || res.data.explication) : res.data.explication);
    } catch (err) {
      console.error('Erreur IA:', err.response?.status, err.response?.data);
      const q = questions[indexActuel];
      setExplicationIA(q.explication || 'Relisez attentivement le document pour identifier la bonne réponse.');
    } finally {
      setChargementIA(false);
    }
  }, [reponseSelectionnee, valide, questions, indexActuel]);

  const recommencer = () => {
    setIndexActuel(0); setScore(0); setTermine(false);
    setValide(false); setReponseSelectionnee(null);
    setExplicationIA(''); setCle(k => k + 1);
  };

  // ——— Chargement / erreur ———
  if (questions.length === 0) return (
    <div className="conteneur-etroit section centre">
      {erreurChargement ? (
        <>
          <p className="titre-3" style={{ marginBottom: 8 }}>Impossible de charger les questions</p>
          <p className="texte-2" style={{ marginBottom: 20 }}>Vérifiez votre connexion, puis réessayez.</p>
          <button className="btn btn-contour" onClick={onRetourDashboard}><Icone nom="retour" taille={16} /> Tableau de bord</button>
        </>
      ) : (
        <>
          <div className="chargeur" style={{ margin: '0 auto 14px' }} />
          <p className="texte-3">Chargement des questions…</p>
        </>
      )}
    </div>
  );

  // ——— Résultat ———
  if (termine) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="conteneur-etroit section">
        <div className="carte centre" style={{ padding: 'clamp(28px, 5vw, 44px)' }}>
          <span className="pastille-icone" style={{ width: 60, height: 60, borderRadius: '50%', background: pct >= 70 ? 'var(--succes-pale)' : 'var(--action-pale)', color: pct >= 70 ? 'var(--succes)' : 'var(--action)', marginBottom: 16 }}>
            <Icone nom={pct >= 70 ? 'coche' : 'graphique'} taille={28} />
          </span>
          <p className="etiquette" style={{ marginBottom: 6 }}>{infos.label}</p>
          <h1 className="titre-1" style={{ marginBottom: 6 }}>Exercice terminé</h1>
          <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, margin: '12px 0 4px' }}>
            {score}<span className="texte-3" style={{ fontSize: '1.6rem' }}> / {questions.length}</span>
          </div>
          <p className="texte-2" style={{ marginBottom: 20 }}>{pct} % de bonnes réponses</p>
          <div className="progression" style={{ maxWidth: 320, margin: '0 auto 28px' }}>
            <div style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--succes)' : 'var(--action)' }} />
          </div>
          <div className="ligne envelopper gap-2" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primaire" onClick={recommencer}>Recommencer</button>
            <button className="btn btn-contour" onClick={onRetourDashboard}>Tableau de bord</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[indexActuel];

  // ——— Question ———
  return (
    <div className="conteneur-etroit" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="ligne entre gap-2" style={{ marginBottom: 14 }}>
        <button className="btn btn-lien btn-petit" onClick={onRetourDashboard} style={{ paddingLeft: 0 }}>
          <Icone nom="retour" taille={16} /> Tableau de bord
        </button>
        <Timer key={cle} duree={120} onExpire={validerReponse} />
      </div>

      <div className="ligne entre gap-2" style={{ marginBottom: 10 }}>
        <span className="ligne gap-1 gras" style={{ color: infos.couleur }}><Icone nom={infos.icone} taille={18} /> {infos.label}</span>
        <span className="petit texte-3 chiffres">Question {indexActuel + 1} / {questions.length}</span>
      </div>
      <div className="progression" style={{ marginBottom: 20 }}>
        <div style={{ width: `${((indexActuel + 1) / questions.length) * 100}%`, background: infos.couleur }} />
      </div>

      <div className="carte" style={{ marginBottom: 16 }}>
        <Question question={q} onReponse={setReponseSelectionnee} reponseSelectionnee={reponseSelectionnee} valide={valide} />
      </div>

      {valide && (
        <div className={`encadre ${reponseSelectionnee === q.correct ? 'encadre-succes' : 'encadre-info'}`} style={{ marginBottom: 16 }}>
          <Icone nom={estPro ? 'etincelle' : 'ampoule'} taille={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="gras" style={{ marginBottom: 4 }}>
              {reponseSelectionnee === q.correct ? 'Bonne réponse !' : 'Pas tout à fait.'}
              <span className="tres-petit" style={{ fontWeight: 600, opacity: 0.7, marginLeft: 8 }}>{estPro ? 'Explication par IA' : 'Explication'}</span>
            </p>
            {chargementIA ? <p className="texte-2">L'IA analyse votre réponse…</p> : <p>{explicationIA}</p>}
          </div>
        </div>
      )}

      {!valide ? (
        <button className="btn btn-nuit btn-grand btn-plein" onClick={validerReponse} disabled={reponseSelectionnee === null}>Valider ma réponse</button>
      ) : (
        <button className="btn btn-primaire btn-grand btn-plein" onClick={questionSuivante}>
          {indexActuel + 1 >= questions.length ? 'Voir mon score' : 'Question suivante'} <Icone nom="fleche" taille={18} />
        </button>
      )}
    </div>
  );
}

export default Quiz;
