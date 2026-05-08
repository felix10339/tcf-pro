import { useState } from 'react';
function Accueil({ onCommencer }) {
  const temoignages = [
    { nom: 'Fatima K.', pays: '🇲🇦 Maroc', score: 'TCF — C2', texte: 'Grâce aux explications de l\'IA, j\'ai compris mes erreurs et progressé très rapidement. Je recommande à 100% !' },
    { nom: 'Jean-Pierre M.', pays: '🇨🇲 Cameroun', score: 'TCF — C1', texte: 'Les exercices audio sont excellents. J\'ai réussi mon TCF du premier coup après 3 semaines de préparation.' },
    { nom: 'Amara D.', pays: '🇸🇳 Sénégal', score: 'TCF — B2', texte: 'L\'IA m\'expliquait chaque erreur avec précision. C\'est ce qui m\'a vraiment fait progresser rapidement.' }
  ];

  const stats = [
    { val: '2 400+', label: 'Candidats préparés' },
    { val: '94%', label: 'Taux de réussite' },
    { val: '1 500+', label: 'Questions disponibles' },
    { val: '4', label: 'Compétences couvertes' }
  ];

  const fonctionnalites = [
    { emoji: '🎧', titre: 'Compréhension orale', desc: 'Enregistrements audio authentiques avec questions chronométrées' },
    { emoji: '📖', titre: 'Compréhension écrite', desc: 'Textes variés sur la culture, la société et la vie quotidienne francophone' },
    { emoji: '✍️', titre: 'Expression écrite', desc: 'Rédactions corrigées par l\'IA avec notes et conseils détaillés' },
    { emoji: '🎤', titre: 'Expression orale', desc: 'Monologues enregistrés et analysés par l\'IA' },
    { emoji: '🤖', titre: 'IA explicative', desc: 'Explication personnalisée après chaque réponse (Pro)' },
    { emoji: '📊', titre: 'Suivi de progression', desc: 'Tableau de bord détaillé par compétence et par niveau' }
  ];

  // Questions démo limitées
  const demoQuestions = [
    {
      texte: 'En France, le baccalauréat est un examen qui sanctionne la fin des études secondaires. Il permet d\'accéder à l\'enseignement supérieur.',
      question: 'À quoi sert le baccalauréat selon le texte ?',
      options: ['Valider les études primaires', 'Accéder à l\'enseignement supérieur', 'Obtenir un diplôme professionnel', 'Entrer dans la fonction publique'],
      correct: 1
    },
    {
      texte: 'La gastronomie française est reconnue dans le monde entier. En 2010, elle a été inscrite au patrimoine culturel immatériel de l\'UNESCO.',
      question: 'Depuis quelle année la gastronomie française est-elle au patrimoine de l\'UNESCO ?',
      options: ['2005', '2008', '2010', '2015'],
      correct: 2
    }
  ];

  const [demoIndex, setDemoIndex] = useState(0);
  const [demoReponse, setDemoReponse] = useState(null);
  const [demoValide, setDemoValide] = useState(false);

  const validerDemo = () => {
    if (demoReponse === null) return;
    setDemoValide(true);
  };

  const questionSuivanteDemo = () => {
    if (demoIndex + 1 < demoQuestions.length) {
      setDemoIndex(i => i + 1);
      setDemoReponse(null);
      setDemoValide(false);
    }
  };

  const q = demoQuestions[demoIndex];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: '#1a1a2e' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #eee', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px' }}>
          TCF<span style={{ color: '#1D9E75' }}>Pro</span> 🇫🇷
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={onCommencer} style={{ fontSize: '13px', color: '#444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Se connecter</button>
          <button onClick={onCommencer} style={{ padding: '9px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Commencer gratuitement →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', padding: '80px 20px 100px', textAlign: 'center', color: '#fff' }}>
        <div style={{ display: 'inline-block', background: 'rgba(29,158,117,0.2)', border: '1px solid rgba(29,158,117,0.4)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#4ECDA4', marginBottom: '24px', fontWeight: '500' }}>
          🚀 La plateforme de préparation au TCF propulsée par l'IA
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' }}>
          Réussissez votre <span style={{ color: '#1D9E75' }}>TCF</span><br />du premier coup
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '560px', margin: '0 auto 36px', lineHeight: '1.7' }}>
          Entraînez-vous avec de vraies questions audio, des textes authentiques et une IA qui explique chaque erreur pour vous faire progresser 3x plus vite.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onCommencer} style={{ padding: '15px 32px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', boxShadow: '0 8px 30px rgba(29,158,117,0.4)' }}>
            Commencer gratuitement →
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '60px', flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#1D9E75' }}>{s.val}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DEMO INTERACTIVE LIMITÉE */}
      <div style={{ background: '#fff', padding: '60px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Essayez gratuitement</h2>
            <p style={{ fontSize: '15px', color: '#888' }}>2 questions de démonstration — créez un compte pour accéder à tout le contenu</p>
          </div>

          <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '24px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Question démo {demoIndex + 1} / {demoQuestions.length}
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '14px', marginBottom: '14px', fontSize: '14px', lineHeight: '1.7', color: '#444' }}>
              {q.texte}
            </div>
            <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '12px' }}>{q.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {q.options.map((opt, i) => {
                let bg = '#fff', border = '1.5px solid #e0e0e0', color = '#333';
                if (demoValide) {
                  if (i === q.correct) { bg = '#E1F5EE'; border = '1.5px solid #1D9E75'; color = '#085041'; }
                  else if (i === demoReponse) { bg = '#FCEBEB'; border = '1.5px solid #E24B4A'; color = '#7B1A1A'; }
                } else if (i === demoReponse) { bg = '#E6F1FB'; border = '1.5px solid #378ADD'; }
                return (
                  <button key={i} onClick={() => !demoValide && setDemoReponse(i)}
                    style={{ padding: '12px 16px', background: bg, border, borderRadius: '10px', textAlign: 'left', cursor: demoValide ? 'default' : 'pointer', fontSize: '14px', color }}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}
            </div>

            {demoValide && (
              <div style={{ background: '#f4f6f8', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', fontSize: '13px', color: '#555' }}>
                💡 <strong>Explication basique</strong> — {demoReponse === q.correct ? 'Bonne réponse !' : 'Mauvaise réponse.'} Créez un compte Pro pour recevoir des explications détaillées par IA.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {!demoValide && (
                <button onClick={validerDemo} disabled={demoReponse === null}
                  style={{ flex: 1, padding: '12px', background: demoReponse === null ? '#ccc' : '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', cursor: demoReponse === null ? 'default' : 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Valider
                </button>
              )}
              {demoValide && demoIndex + 1 < demoQuestions.length && (
                <button onClick={questionSuivanteDemo} style={{ flex: 1, padding: '12px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Question suivante →
                </button>
              )}
              {demoValide && demoIndex + 1 >= demoQuestions.length && (
                <button onClick={onCommencer} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                  🚀 Créer un compte pour continuer →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FONCTIONNALITÉS */}
      <div style={{ background: '#f4f6f8', padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '34px', fontWeight: '800', marginBottom: '12px' }}>Tout ce qu'il vous faut pour réussir</h2>
            <p style={{ fontSize: '16px', color: '#888', maxWidth: '500px', margin: '0 auto' }}>Une plateforme complète couvrant les 4 compétences du TCF, propulsée par l'intelligence artificielle.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {fonctionnalites.map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.emoji}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{f.titre}</div>
                <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TÉMOIGNAGES */}
      <div style={{ background: '#fff', padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '34px', fontWeight: '800', marginBottom: '12px' }}>Ils ont réussi leur TCF 🎉</h2>
            <p style={{ fontSize: '16px', color: '#888' }}>Des vrais résultats, des vraies personnes</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {temoignages.map((t, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: '14px', padding: '24px', border: '1px solid #eee' }}>
                <div style={{ fontSize: '20px', marginBottom: '12px' }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.7', marginBottom: '16px', fontStyle: 'italic' }}>"{t.texte}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{t.nom}</div>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>{t.pays}</div>
                  </div>
                  <div style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>{t.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Prêt à réussir votre TCF ?</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
          Rejoignez des milliers de candidats qui se préparent avec TCFPro chaque jour.
        </p>
        <button onClick={onCommencer} style={{ padding: '16px 40px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '17px', fontWeight: '700', boxShadow: '0 8px 30px rgba(29,158,117,0.4)' }}>
          Commencer gratuitement →
        </button>
      </div>

      <div style={{ background: '#111', padding: '24px', textAlign: 'center', color: '#555', fontSize: '13px' }}>
        © 2025 TCFPro — Tous droits réservés
      </div>
    </div>
  );
}


export default Accueil;