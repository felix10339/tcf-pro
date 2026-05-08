import { useState } from 'react';
import axios from 'axios';

function Generateur({ onRetour }) {
  const [theme, setTheme] = useState('');
  const [section, setSection] = useState('comprehension-ecrite');
  const [niveau, setNiveau] = useState('B2');
  const [nombre, setNombre] = useState(5);
  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');

  const themesPopulaires = [
    'Le système de santé au Québec',
    'La recherche d\'emploi au Canada',
    'Les transports en commun à Montréal',
    'Le logement et la location au Québec',
    'L\'immigration et la résidence permanente',
    'Le système scolaire canadien',
    'L\'environnement et le développement durable',
    'La culture et les fêtes québécoises',
    'Les droits des travailleurs au Canada',
    'La vie quotidienne à Montréal'
  ];

  const generer = async () => {
    if (!theme.trim()) {
      setErreur('Veuillez entrer un thème');
      return;
    }
    setErreur('');
    setChargement(true);
    setResultat(null);

    try {
      const res = await axios.post('${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ia/generer-questions', {
        theme, section, niveau, nombre
      });
      setResultat(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        padding: '28px 32px 60px', color: '#fff'
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <button
            onClick={onRetour}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 }}
          >
            ← Retour au tableau de bord
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
            🤖 Générateur de questions IA
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Créez des questions TCF illimitées sur n'importe quel thème en quelques secondes
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>

        {/* Formulaire */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Configurer la génération</h3>

          {/* Thème */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>
              Thème des questions *
            </label>
            <input
              type="text"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="Ex : Le système de santé au Québec"
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #e8e8e8', borderRadius: '10px',
                fontSize: '14px', background: '#fafafa', boxSizing: 'border-box'
              }}
            />

            {/* Thèmes populaires */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>Thèmes populaires :</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {themesPopulaires.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTheme(t)}
                    style={{
                      padding: '5px 12px',
                      background: theme === t ? '#E1F5EE' : '#f4f6f8',
                      border: theme === t ? '1px solid #1D9E75' : '1px solid #eee',
                      borderRadius: '20px', cursor: 'pointer',
                      fontSize: '12px', color: theme === t ? '#0F6E56' : '#666',
                      fontWeight: theme === t ? '600' : '400'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section + Niveau + Nombre */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Section</label>
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', cursor: 'pointer' }}
              >
                <option value="comprehension-ecrite">📖 Compréhension écrite</option>
                <option value="comprehension-orale">🎧 Compréhension orale</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Niveau</label>
              <select
                value={niveau}
                onChange={e => setNiveau(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', cursor: 'pointer' }}
              >
                <option value="A2">A2 — Débutant</option>
                <option value="B1">B1 — Intermédiaire</option>
                <option value="B2">B2 — Avancé</option>
                <option value="C1">C1 — Supérieur</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Nombre</label>
              <select
                value={nombre}
                onChange={e => setNombre(parseInt(e.target.value))}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', cursor: 'pointer' }}
              >
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
              </select>
            </div>
          </div>

          {erreur && (
            <div style={{ background: '#fff5f5', border: '1.5px solid #fed7d7', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#c53030' }}>
              ⚠️ {erreur}
            </div>
          )}

          <button
            onClick={generer}
            disabled={chargement}
            style={{
              width: '100%', padding: '14px',
              background: chargement ? '#ccc' : 'linear-gradient(135deg, #1D9E75, #0F6E56)',
              color: '#fff', border: 'none', borderRadius: '10px',
              cursor: chargement ? 'default' : 'pointer',
              fontSize: '15px', fontWeight: '700',
              boxShadow: chargement ? 'none' : '0 4px 15px rgba(29,158,117,0.35)'
            }}
          >
            {chargement ? '⏳ Génération en cours... (15-30 secondes)' : `🤖 Générer ${nombre} questions sur "${theme || 'ce thème'}"`}
          </button>
        </div>

        {/* Résultat */}
        {resultat && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#E1F5EE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F6E56' }}>
                  {resultat.nombreGenere} questions générées avec succès !
                </div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  Ajoutées à la section {section === 'comprehension-ecrite' ? 'Compréhension écrite' : 'Compréhension orale'} — Niveau {niveau}
                </div>
              </div>
            </div>

            {/* Aperçu des questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resultat.questions.map((q, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '11px', color: '#1D9E75', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Question {i + 1}
                  </div>
                  <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', lineHeight: '1.6', fontStyle: 'italic' }}>
                    "{q.texte}"
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{q.question}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {q.options.map((opt, j) => (
                      <span key={j} style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                        background: j === q.correct ? '#E1F5EE' : '#f0f0f0',
                        color: j === q.correct ? '#0F6E56' : '#666',
                        fontWeight: j === q.correct ? '700' : '400',
                        border: j === q.correct ? '1px solid #9FE1CB' : '1px solid #e0e0e0'
                      }}>
                        {j === q.correct ? '✓ ' : ''}{String.fromCharCode(65 + j)}. {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { setResultat(null); setTheme(''); }}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                Générer d'autres questions
              </button>
              <button
                onClick={onRetour}
                style={{ flex: 1, padding: '12px', background: '#f4f6f8', color: '#444', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                Aller s'exercer →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Generateur;