import { useState } from 'react';
import axios from 'axios';
import sujets from '../data/sujets-expression-ecrite';
import API_URL from '../config';

function ExpressionEcrite({ onRetour }) {
  const [phase, setPhase] = useState('choix');
  const [sujetChoisi, setSujetChoisi] = useState(null);
  const [redaction, setRedaction] = useState('');
  const [chargement, setChargement] = useState(false);
  const [correction, setCorrection] = useState(null);

  const niveauCouleur = { 'B1': '#1D9E75', 'B2': '#378ADD', 'C1': '#7F77DD' };

  const compterMots = (texte) => texte.trim().split(/\s+/).filter(m => m.length > 0).length;

  const soumettre = async () => {
    if (!redaction.trim()) return;
    setChargement(true);
    try {
      const res = await axios.post( `${process.env.REACT_APP_API_URL || '`${API_URL}`'}/api/ia/corriger-redaction`, {
        tache: sujetChoisi.tache,
        sujet: sujetChoisi.sujet,
        redaction,
        niveau: sujetChoisi.niveau
      });   
      setCorrection(res.data);
      setPhase('correction');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la correction. Vérifiez votre crédit Anthropic.');
    } finally {
      setChargement(false);
    }
  };

  const nbMots = compterMots(redaction);
  const motsSuffisants = nbMots >= sujetChoisi?.minMots;
  const motsTropLongs = nbMots > (sujetChoisi?.maxMots || 999);

  // CHOIX DU SUJET
  if (phase === 'choix') return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '32px 32px 70px', color: '#fff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 }}>← Retour</button>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>✍️ Expression écrite</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Choisissez un sujet et rédigez votre texte — l'IA corrige et note votre production</p>
        </div>
      </div>
      <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sujets.map(s => (
            <div key={s.id} onClick={() => { setSujetChoisi(s); setPhase('redaction'); }}
              style={{ background: '#fff', borderRadius: '14px', padding: '20px 24px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '2px solid transparent', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = niveauCouleur[s.niveau]; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: niveauCouleur[s.niveau] }}>{s.tache}</div>
                <span style={{ background: niveauCouleur[s.niveau] + '20', color: niveauCouleur[s.niveau], fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>{s.niveau}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', marginBottom: '10px' }}>{s.sujet}</p>
              <div style={{ fontSize: '12px', color: '#aaa' }}>{s.minMots}–{s.maxMots} mots → Commencer →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // RÉDACTION
  if (phase === 'redaction') return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '28px 32px 60px', color: '#fff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <button onClick={() => setPhase('choix')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '12px', padding: 0 }}>← Changer de sujet</button>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>{sujetChoisi.tache} — Niveau {sujetChoisi.niveau}</div>
          <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>{sujetChoisi.sujet}</p>
        </div>
      </div>
      <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>
        {/* Consignes */}
        <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#185FA5', fontWeight: '600', marginBottom: '6px' }}>📋 Consignes</p>
          {sujetChoisi.consignes.map((c, i) => (
            <p key={i} style={{ fontSize: '13px', color: '#0C447C', marginBottom: '2px' }}>• {c}</p>
          ))}
        </div>

        {/* Zone de rédaction */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          <textarea
            value={redaction}
            onChange={e => setRedaction(e.target.value)}
            placeholder="Rédigez votre texte ici..."
            style={{
              width: '100%', minHeight: '280px', border: 'none', outline: 'none',
              fontSize: '15px', lineHeight: '1.8', color: '#333', resize: 'vertical',
              fontFamily: 'inherit', boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: '13px', color: motsTropLongs ? '#E24B4A' : motsSuffisants ? '#1D9E75' : '#aaa', fontWeight: '500' }}>
              {nbMots} mot{nbMots > 1 ? 's' : ''} / {sujetChoisi.minMots}–{sujetChoisi.maxMots} requis
              {motsSuffisants && !motsTropLongs ? ' ✓' : ''}
              {motsTropLongs ? ' (trop long)' : ''}
            </span>
            <div style={{ height: '6px', width: '120px', background: '#f0f0f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((nbMots / sujetChoisi.maxMots) * 100, 100)}%`, background: motsTropLongs ? '#E24B4A' : motsSuffisants ? '#1D9E75' : '#EF9F27', borderRadius: '6px', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        <button onClick={soumettre} disabled={chargement || nbMots < 10}
          style={{ width: '100%', padding: '14px', background: nbMots < 10 || chargement ? '#ccc' : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '12px', cursor: nbMots < 10 || chargement ? 'default' : 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: nbMots < 10 ? 'none' : '0 4px 15px rgba(29,158,117,0.35)' }}>
          {chargement ? '⏳ Correction en cours...' : '🤖 Soumettre pour correction IA'}
        </button>
      </div>
    </div>
  );

  // CORRECTION
  if (phase === 'correction' && correction) {
    const couleurNote = correction.note / correction.note_max >= 0.75 ? '#1D9E75' : correction.note / correction.note_max >= 0.5 ? '#EF9F27' : '#E24B4A';
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '32px 32px 70px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>Correction IA</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{sujetChoisi.tache}</p>
        </div>
        <div style={{ maxWidth: '760px', margin: '-32px auto 0', padding: '0 20px 40px' }}>

          {/* Note */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', fontWeight: '800', color: couleurNote }}>{correction.note}<span style={{ fontSize: '24px', color: '#aaa' }}>/{correction.note_max}</span></div>
            <div style={{ display: 'inline-block', marginTop: '8px', background: couleurNote + '20', color: couleurNote, padding: '5px 16px', borderRadius: '20px', fontSize: '15px', fontWeight: '700' }}>
              Niveau estimé : {correction.niveau_estime}
            </div>
          </div>

          {/* Points forts */}
          <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F6E56', marginBottom: '10px' }}>✅ Points forts</p>
            {correction.points_forts?.map((p, i) => <p key={i} style={{ fontSize: '14px', color: '#085041', marginBottom: '4px' }}>• {p}</p>)}
          </div>

          {/* Points à améliorer */}
          <div style={{ background: '#FAEEDA', border: '1px solid #FAC775', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#854F0B', marginBottom: '10px' }}>⚠️ Points à améliorer</p>
            {correction.points_ameliorer?.map((p, i) => <p key={i} style={{ fontSize: '14px', color: '#633806', marginBottom: '4px' }}>• {p}</p>)}
          </div>

          {/* Erreurs */}
          {correction.erreurs?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>🔍 Erreurs détectées</p>
              {correction.erreurs.map((e, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #E24B4A' }}>
                  <div style={{ fontSize: '12px', color: '#E24B4A', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>{e.type}</div>
                  <div style={{ fontSize: '13px', color: '#A32D2D', textDecoration: 'line-through', marginBottom: '2px' }}>{e.texte}</div>
                  <div style={{ fontSize: '13px', color: '#0F6E56', fontWeight: '500' }}>→ {e.correction}</div>
                </div>
              ))}
            </div>
          )}

          {/* Conseil global */}
          <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#185FA5', marginBottom: '8px' }}>💡 Conseil de votre professeur IA</p>
            <p style={{ fontSize: '14px', color: '#0C447C', lineHeight: '1.7' }}>{correction.conseils}</p>
          </div>

          {/* Version corrigée */}
          {correction.version_corrigee && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>✨ Version améliorée suggérée</p>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', fontStyle: 'italic' }}>{correction.version_corrigee}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setRedaction(''); setCorrection(null); setPhase('redaction'); }}
              style={{ flex: 1, padding: '14px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
              Réécrire
            </button>
            <button onClick={() => { setPhase('choix'); setRedaction(''); setCorrection(null); }}
              style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#444' }}>
              Autre sujet
            </button>
            <button onClick={onRetour}
              style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#444' }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ExpressionEcrite;