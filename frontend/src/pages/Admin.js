import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import EntetePage from '../components/EntetePage';
import Icone from '../components/Icone';
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

  // La génération produit des QCM : elle ne concerne que les épreuves de compréhension.
  const SECTIONS_ADMIN = [
    { key: 'comprehension-ecrite', label: 'Compréhension écrite', icone: 'livre', couleur: 'var(--ce)' },
    { key: 'comprehension-orale', label: 'Compréhension orale', icone: 'casque', couleur: 'var(--co)' }
  ];

  return (
    <div>
      <EntetePage surTitre="Administration" titre="Générateur de questions" sousTitre="Créez des questions TCF Canada avec l'IA. Elles sont ajoutées immédiatement à la banque de questions de tous les utilisateurs." onRetour={onRetour} />

      <main className="conteneur chevauche" style={{ maxWidth: 860, paddingBottom: 56 }}>
        <div className="carte pile gap-3" style={{ marginBottom: 20 }}>
          <div className="champ-groupe">
            <span className="champ-label">Épreuve</span>
            <div className="segments">
              {SECTIONS_ADMIN.map(s => (
                <button key={s.key} type="button" className={`segment${section === s.key ? ' actif' : ''}`} onClick={() => { setSection(s.key); setTheme(''); }}>
                  <span className="ligne gap-1" style={{ justifyContent: 'center', color: section === s.key ? s.couleur : undefined }}><Icone nom={s.icone} taille={16} /> {s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="champ-groupe">
            <label className="champ-label" htmlFor="theme-admin">Thème</label>
            <input id="theme-admin" className="champ" type="text" value={theme} onChange={e => setTheme(e.target.value)} placeholder="Saisissez un thème ou choisissez une suggestion ci-dessous" />
            <div className="ligne envelopper gap-1" style={{ marginTop: 6 }}>
              {(themesParSection[section] || []).map(t => (
                <button key={t} type="button" onClick={() => setTheme(t)} className="badge"
                  style={{ border: '1px solid var(--bordure)', cursor: 'pointer', fontWeight: 600, background: theme === t ? 'var(--action)' : 'var(--surface)', color: theme === t ? '#fff' : 'var(--texte-2)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grille grille-2">
            <div className="champ-groupe">
              <label className="champ-label" htmlFor="niveau-admin">Niveau</label>
              <select id="niveau-admin" className="champ" value={niveau} onChange={e => setNiveau(e.target.value)}>
                <option value="A1">A1 — Découverte</option>
                <option value="A2">A2 — Survie</option>
                <option value="B1">B1 — Intermédiaire</option>
                <option value="B2">B2 — Avancé</option>
                <option value="C1">C1 — Autonome</option>
                <option value="C2">C2 — Maîtrise</option>
              </select>
            </div>
            <div className="champ-groupe">
              <label className="champ-label" htmlFor="nombre-admin">Nombre de questions</label>
              <select id="nombre-admin" className="champ" value={nombre} onChange={e => setNombre(parseInt(e.target.value, 10))}>
                {[3, 5, 10, 15].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>

          {erreur && <div className="message-erreur" role="alert">{erreur}</div>}

          <button className="btn btn-primaire btn-grand btn-plein" onClick={generer} disabled={chargement}>
            {chargement ? 'Génération en cours… (15 à 30 secondes)' : <><Icone nom="etincelle" taille={18} /> Générer {nombre} questions</>}
          </button>
          <p className="tres-petit texte-3 centre">Relisez les questions générées : l'IA peut se tromper. Une question fausse nuit à la crédibilité du site.</p>
        </div>

        {resultat && (
          <div className="carte">
            <div className="encadre encadre-succes" style={{ marginBottom: 18 }}>
              <Icone nom="coche" taille={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div><p className="gras">{resultat.nombreGenere} questions ajoutées</p><p className="petit">Elles sont déjà visibles par tous les utilisateurs.</p></div>
            </div>

            <div className="pile gap-2">
              {resultat.questions.map((q, i) => (
                <div key={q.id || i} style={{ padding: 16, border: '1px solid var(--bordure)', borderRadius: 'var(--rayon-sm)' }}>
                  <div className="ligne entre" style={{ marginBottom: 8 }}>
                    <span className="etiquette">Question {i + 1}</span>
                    <span className="badge">ID {q.id}</span>
                  </div>
                  {q.image && <img src={q.image} alt={q.texte} style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, marginBottom: 10 }} />}
                  <p className="document petit" style={{ marginBottom: 10 }}>{q.audio_texte || q.texte}</p>
                  <p className="gras" style={{ marginBottom: 10 }}>{q.question}</p>
                  <div className="pile gap-1">
                    {(Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')).map((opt, j) => (
                      <span key={j} className="petit" style={{ padding: '6px 10px', borderRadius: 6, background: j === q.correct ? 'var(--succes-pale)' : 'var(--surface-2)', color: j === q.correct ? 'var(--succes)' : 'var(--texte-2)', fontWeight: j === q.correct ? 700 : 400 }}>
                        {j === q.correct ? '✓ ' : ''}{String.fromCharCode(65 + j)}. {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-nuit btn-plein" style={{ marginTop: 18 }} onClick={() => { setResultat(null); setTheme(''); }}>Générer d'autres questions</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
