import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Question from '../components/Question';
import Timer from '../components/Timer';
import API_URL from '../config';

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

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || '`${API_URL}`'}/api/questions/section/${section}`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error(err));
  }, [section]);

  const sauvegarderStats = useCallback((bonnesReponses, totalQuestions) => {
    const key = `stats-${utilisateur.id}`;
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
    if (reponseSelectionnee === null) return;
    setValide(true);
    setChargementIA(true);

    if (reponseSelectionnee === questions[indexActuel].correct) {
      setScore(s => s + 1);
    }

    try {
      const q = questions[indexActuel];
      const res = await axios.post( `${process.env.REACT_APP_API_URL || '`${API_URL}`'}/api/ia/expliquer`, {
        question: q.question,
        reponseUtilisateur: reponseSelectionnee,
        bonneReponse: q.correct,
        optionChoisie: q.options[reponseSelectionnee],
        bonneOption: q.options[q.correct]
      });
      setExplicationIA(res.data.explication);
    } catch (err) {
      const q = questions[indexActuel];
      setExplicationIA(q.explication);
    } finally {
      setChargementIA(false);
    }
  }, [reponseSelectionnee, questions, indexActuel]);

  if (questions.length === 0) return <p style={{ padding: '20px' }}>Chargement des questions...</p>;

  if (termine) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '20px' }}>
        <h2>Exercice terminé !</h2>
        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1D9E75', margin: '16px 0' }}>
          {score} / {questions.length}
        </p>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          {Math.round((score / questions.length) * 100)}% de bonnes réponses
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => { setIndexActuel(0); setScore(0); setTermine(false); setValide(false); setReponseSelectionnee(null); setExplicationIA(''); setCle(k => k + 1); }}
            style={{ padding: '12px 24px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}
          >
            Recommencer
          </button>
          <button
            onClick={onRetourDashboard}
            style={{ padding: '12px 24px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}
          >
            Tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const q = questions[indexActuel];

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <button onClick={onRetourDashboard} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '4px' }}>
            ← Tableau de bord
          </button>
          <div style={{ fontSize: '14px', color: '#888' }}>Question {indexActuel + 1} / {questions.length}</div>
        </div>
        <Timer key={cle} duree={120} onExpire={validerReponse} />
      </div>

      <div style={{ height: '4px', background: '#eee', borderRadius: '4px', marginBottom: '20px' }}>
        <div style={{ height: '100%', width: `${((indexActuel + 1) / questions.length) * 100}%`, background: '#1D9E75', borderRadius: '4px', transition: 'width 0.4s' }} />
      </div>

      <Question
        question={q}
        onReponse={setReponseSelectionnee}
        reponseSelectionnee={reponseSelectionnee}
        valide={valide}
      />

      {valide && (
        <div style={{ marginTop: '16px', background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '8px', padding: '14px' }}>
          <p style={{ fontSize: '12px', color: '#185FA5', fontWeight: '500', marginBottom: '6px' }}>
            💡 Explication personnalisée par IA
          </p>
          {chargementIA ? (
            <p style={{ fontSize: '13px', color: '#378ADD' }}>L'IA analyse votre réponse...</p>
          ) : (
            <p style={{ fontSize: '13px', color: '#0C447C', lineHeight: '1.6' }}>{explicationIA}</p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {!valide && (
          <button
            onClick={validerReponse}
            disabled={reponseSelectionnee === null}
            style={{ padding: '10px 20px', background: reponseSelectionnee === null ? '#ccc' : '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', cursor: reponseSelectionnee === null ? 'default' : 'pointer', fontSize: '14px' }}
          >
            Valider
          </button>
        )}
        {valide && (
          <button
            onClick={questionSuivante}
            style={{ padding: '10px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            {indexActuel + 1 >= questions.length ? 'Voir mon score' : 'Question suivante →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;