import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
function Admin({ onRetour }) {
  const [theme, setTheme] = useState('');
  const [section, setSection] = useState('comprehension-ecrite');
  const [niveau, setNiveau] = useState('B2');
  const [nombre, setNombre] = useState(5);
  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');

  const themesParSection = {
    'comprehension-ecrite': [
      'Chercher un logement (annonces, bail, relations avec le propriétaire)',
      'Le marché du travail et la recherche d\'emploi au Canada',
      'Le système de santé et l\'assurance maladie provinciale',
      'L\'école, les garderies et l\'éducation des enfants',
      'Les services gouvernementaux (Service Canada, NAS, impôts, IRCC)',
      'L\'hiver canadien, le climat et l\'environnement',
      'La francophonie canadienne (Québec, Acadie, Ontario, Ouest)',
      'La vie de quartier, le bénévolat et la vie communautaire',
      'Les transports en commun et la mobilité',
      'Société canadienne : immigration, multiculturalisme, Premières Nations'
    ],
    'comprehension-orale': [
      'Messages vocaux (garderie, clinique, employeur, propriétaire)',
      'Annonces publiques (métro, autobus, aéroport, épicerie)',
      'Dialogues au guichet (Service Canada, banque, pharmacie)',
      'Entrevues d\'embauche et conversations au travail',
      'Bulletins de circulation et météo hivernale',
      'Émissions de radio canadiennes (actualité, société)',
      'Témoignages de nouveaux arrivants',
      'Conversations entre voisins et amis',
      'Reportages sur la vie en région',
      'Débats et chroniques d\'opinion'
    ],
    'expression-ecrite': [
      'Courriel à un propriétaire ou un voisin',
      'Message à un employeur ou un collègue',
      'Récit : mon premier hiver au Canada',
      'Article sur une expérience de bénévolat',
      'Argumentation : télétravail ou bureau ?',
      'Argumentation : s\'installer en région ou en ville ?',
      'Argumentation : transport en commun gratuit ?',
      'Argumentation : reconnaissance des diplômes étrangers'
    ],
    'expression-orale': [
      'Entretien : se présenter et son projet au Canada',
      'Interaction : louer un appartement',
      'Interaction : inscrire son enfant à l\'école',
      'Interaction : s\'informer sur un emploi',
      'Point de vue : emploi ou langue d\'abord ?',
      'Point de vue : bilinguisme et langue minoritaire',
      'Point de vue : réseaux sociaux et intégration',
      'Point de vue : vivre en région'
    ]
  };

  const generer = async () => {
    if (!theme.trim()) { setErreur('Veuillez choisir ou saisir un thème'); return; }
    setErreur('');
    setChargement(true);
    setResultat(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
         `${API_URL}/api/ia/generer-questions`,
        { theme, section, niveau, nombre },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResultat(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e, #2d1b5e, #3d2480)', padding: '28px 32px 60px', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 }}>← Retour</button>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>⚙️ Panneau d'administration</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Générez des questions TCF avec l'IA — elles seront disponibles pour tous les utilisateurs</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '-32px auto 0', padding: '0 20px 40px' }}>

        {/* Formulaire génération */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' }}>🤖 Générer des questions avec l'IA</h3>

          {/* Section */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Section</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { key: 'comprehension-ecrite', label: '📖 Compréhension écrite', couleur: '#378ADD' },
                { key: 'comprehension-orale', label: '🎧 Compréhension orale', couleur: '#1D9E75' },
                { key: 'expression-ecrite', label: '✍️ Expression écrite', couleur: '#EF9F27' },
                { key: 'expression-orale', label: '🎤 Expression orale', couleur: '#D4537E' }
              ].map(s => (
                <button key={s.key} onClick={() => { setSection(s.key); setTheme(''); }}
                  style={{ padding: '12px', border: section === s.key ? `2px solid ${s.couleur}` : '1.5px solid #eee', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: section === s.key ? '700' : '500', background: section === s.key ? s.couleur + '15' : '#fff', color: section === s.key ? s.couleur : '#444', transition: 'all 0.15s' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thème */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Thème</label>
            <input type="text" value={theme} onChange={e => setTheme(e.target.value)}
              placeholder="Saisissez ou choisissez un thème ci-dessous..."
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(themesParSection[section] || []).map((t, i) => (
                <button key={i} onClick={() => setTheme(t)}
                  style={{ padding: '5px 12px', background: theme === t ? '#7F77DD' : '#f4f6f8', border: theme === t ? '1px solid #7F77DD' : '1px solid #eee', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', color: theme === t ? '#fff' : '#666', fontWeight: theme === t ? '600' : '400' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Niveau + Nombre */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Niveau</label>
              <select value={niveau} onChange={e => setNiveau(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', cursor: 'pointer' }}>
                <option value="A1">A1 — Découverte</option>
                <option value="A2">A2 — Survie</option>
                <option value="B1">B1 — Intermédiaire</option>
                <option value="B2">B2 — Avancé</option>
                <option value="C1">C1 — Autonome</option>
                <option value="C2">C2 — Maîtrise</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Nombre de questions</label>
              <select value={nombre} onChange={e => setNombre(parseInt(e.target.value))}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', cursor: 'pointer' }}>
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
              </select>
            </div>
          </div>

          {erreur && (
            <div style={{ background: '#fff5f5', border: '1.5px solid #fed7d7', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#c53030' }}>
              ⚠️ {erreur}
            </div>
          )}

          <button onClick={generer} disabled={chargement}
            style={{ width: '100%', padding: '14px', background: chargement ? '#ccc' : 'linear-gradient(135deg, #7F77DD, #5A52B5)', color: '#fff', border: 'none', borderRadius: '10px', cursor: chargement ? 'default' : 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: chargement ? 'none' : '0 4px 15px rgba(127,119,221,0.35)' }}>
            {chargement ? '⏳ Génération en cours... (15-30 secondes)' : `🤖 Générer ${nombre} questions — "${theme || 'choisir un thème'}"`}
          </button>
        </div>

        {/* Résultat */}
        {resultat && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#E1F5EE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F6E56' }}>
                  {resultat.nombreGenere} questions ajoutées avec succès !
                </div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  Désormais visibles par tous les utilisateurs dans la section correspondante
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resultat.questions.map((q, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#7F77DD', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question {i + 1}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>ID: {q.id}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', fontStyle: 'italic', lineHeight: '1.6' }}>"{q.texte}"</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{q.question}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')).map((opt, j) => (
                      <span key={j} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: j === q.correct ? '#E1F5EE' : '#f0f0f0', color: j === q.correct ? '#0F6E56' : '#666', fontWeight: j === q.correct ? '700' : '400', border: j === q.correct ? '1px solid #9FE1CB' : '1px solid #e0e0e0' }}>
                        {j === q.correct ? '✓ ' : ''}{String.fromCharCode(65 + j)}. {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => { setResultat(null); setTheme(''); }}
              style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'linear-gradient(135deg, #7F77DD, #5A52B5)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              Générer d'autres questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;