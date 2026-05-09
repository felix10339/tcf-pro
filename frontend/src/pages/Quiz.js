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
    const token = localStorage.getItem('token');
    axios.get(API_URL + '/api/questions/section/' + section, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => setQuestions(res.data))
      .catch(err => console.error(err));
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
    if (reponseSelectionnee === null) return;
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
        {
          headers: { Authorization: 'Bearer ' + token }
        }
      );
      setExplicationIA(res.data.explication);
    } catch (err) {
      console.error('Erreur IA:', err.response?.status, err.response?.data);
      const q = questions[indexActuel];
      setExplicationIA(q.explication || "Relisez attentivement le texte pour identifier la bonne réponse.");
    } finally {
      setChargementIA(false);
    }
  }, [reponseSelectionnee, questions, indexActuel]);

  if (questions.length === 0) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
      Chargement des questions...
    </div>
  );

  if (termine) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>{score / questions.length >= 0.7 ? '🎉' : '💪'}</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Exercice terminé !</h2>
        <p style={{ fontSize: '36px', fontWeight: '800', color: '#1D9E75', margin: '16px 0' }}>
          {score} / {questions.length}
        </p>
        <p style={{ color: '#888', fontSize: '15px', marginBottom: '28px' }}>
          {Math.round((score / questions.length) * 100)}% de bonnes réponses
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setIndexActuel(0); setScore(0); setTermine(false);
              setValide(false); setReponseSelectionnee(null);
              setExplicationIA(''); setCle(k => k + 1);
            }}
            style={{ padding: '12px 24px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}
          >
            Recommencer
          </button>
          <button
            onClick={onRetourDashboard}
            style={{ padding: '12px 24px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontSize: '15px' }}
          >
            Tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const q = questions[indexActuel];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <button onClick={onRetourDashboard} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '4px', display: 'block' }}>
            ← Tableau de bord
          </button>
          <div style={{ fontSize: '13px', color: '#888' }}>
            Question {indexActuel + 1} / {questions.length}
          </div>
        </div>
        <Timer key={cle} duree={120} onExpire={validerReponse} />
      </div>

      <div style={{ height: '4px', background: '#eee', borderRadius: '4px', marginBottom: '20px' }}>
        <div style={{
          height: '100%',
          width: ((indexActuel + 1) / questions.length * 100) + '%',
          background: '#1D9E75', borderRadius: '4px', transition: 'width 0.4s'
        }} />
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        <Question
          question={q}
          onReponse={setReponseSelectionnee}
          reponseSelectionnee={reponseSelectionnee}
          valide={valide}
        />
      </div>

      {valide && (
        <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#185FA5', fontWeight: '600', marginBottom: '6px' }}>
            💡 {utilisateur?.abonnement === 'pro' ? 'Explication personnalisée par IA' : 'Explication'}
          </p>
          {chargementIA ? (
            <p style={{ fontSize: '13px', color: '#378ADD' }}>L'IA analyse votre réponse...</p>
          ) : (
            <p style={{ fontSize: '13px', color: '#0C447C', lineHeight: '1.7' }}>{explicationIA}</p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        {!valide && (
          <button
            onClick={validerReponse}
            disabled={reponseSelectionnee === null}
            style={{
              flex: 1, padding: '12px',
              background: reponseSelectionnee === null ? '#e5e7eb' : 'linear-gradient(135deg, #1D9E75, #0F6E56)',
              color: reponseSelectionnee === null ? '#9ca3af' : '#fff',
              border: 'none', borderRadius: '10px',
              cursor: reponseSelectionnee === null ? 'default' : 'pointer',
              fontSize: '14px', fontWeight: '700'
            }}
          >
            Valider
          </button>
        )}
        {valide && (
          <button
            onClick={questionSuivante}
            style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
          >
            {indexActuel + 1 >= questions.length ? 'Voir mon score' : 'Question suivante →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;