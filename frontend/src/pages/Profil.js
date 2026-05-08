import { useState, useEffect } from 'react';
import axios from 'axios';

function Profil({ utilisateur, onMisAJour, onRetour, onTarifs }) {
  const [stats, setStats] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [onglet, setOnglet] = useState('apercu');
  const [modifNom, setModifNom] = useState(false);
  const [nouveauNom, setNouveauNom] = useState(utilisateur.nom);
  const [ancienMDP, setAncienMDP] = useState('');
  const [nouveauMDP, setNouveauMDP] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);
  const estPro = utilisateur?.abonnement === 'pro';

  useEffect(() => {
    const s = localStorage.getItem(`stats-${utilisateur.id}`);
    if (s) setStats(JSON.parse(s));

    const h = localStorage.getItem(`historique-${utilisateur.id}`);
    if (h) setHistorique(JSON.parse(h));
  }, [utilisateur.id]);

  const tauxReussite = stats?.totalQuestions > 0
    ? Math.round((stats.bonnesReponses / stats.totalQuestions) * 100)
    : 0;

  const niveau = tauxReussite >= 80 ? 'C1' : tauxReussite >= 60 ? 'B2' : tauxReussite >= 40 ? 'B1' : 'A2';
  const couleurNiveau = { C1: '#1D9E75', B2: '#378ADD', B1: '#EF9F27', A2: '#E24B4A' }[niveau];

  const sections = [
    { key: 'comprehension-ecrite', label: 'Compréhension écrite', emoji: '📖', couleur: '#378ADD' },
    { key: 'comprehension-orale', label: 'Compréhension orale', emoji: '🎧', couleur: '#1D9E75' },
    { key: 'expression-ecrite', label: 'Expression écrite', emoji: '✍️', couleur: '#EF9F27' },
    { key: 'expression-orale', label: 'Expression orale', emoji: '🎤', couleur: '#D4537E' }
  ];

  const sauvegarderNom = async () => {
    if (!nouveauNom.trim()) return;
    setChargement(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/modifier-profil`,
        { nom: nouveauNom },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const u = { ...utilisateur, nom: nouveauNom };
      localStorage.setItem('utilisateur', JSON.stringify(u));
      onMisAJour(u);
      setModifNom(false);
      setMessage('✅ Nom modifié avec succès');
    } catch { setMessage('❌ Erreur lors de la modification'); }
    finally { setChargement(false); setTimeout(() => setMessage(''), 3000); }
  };

  const changerMotDePasse = async () => {
    if (!ancienMDP || !nouveauMDP) { setMessage('❌ Remplissez tous les champs'); return; }
    if (nouveauMDP.length < 6) { setMessage('❌ Mot de passe trop court (6 caractères min)'); return; }
    setChargement(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL ||  'http://localhost:5000'}/api/auth/changer-mot-de-passe`,
        { ancienMotDePasse: ancienMDP, nouveauMotDePasse: nouveauMDP },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAncienMDP(''); setNouveauMDP('');
      setMessage('✅ Mot de passe modifié avec succès');
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Erreur lors du changement');
    } finally { setChargement(false); setTimeout(() => setMessage(''), 4000); }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '14px',
    background: '#fafafa', boxSizing: 'border-box'
  };

  const onglets = [
    { key: 'apercu', label: '📊 Aperçu' },
    { key: 'progression', label: '📈 Progression' },
    { key: 'compte', label: '⚙️ Mon compte' },
    { key: 'abonnement', label: '💳 Abonnement' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '32px 32px 80px', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={onRetour} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0 }}>
            ← Retour au tableau de bord
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#fff', flexShrink: 0, boxShadow: '0 4px 20px rgba(29,158,117,0.4)' }}>
              {utilisateur.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{utilisateur.nom}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>{utilisateur.email}</p>
              <span style={{ background: estPro ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.1)', border: `1px solid ${estPro ? 'rgba(29,158,117,0.5)' : 'rgba(255,255,255,0.2)'}`, color: estPro ? '#4ECDA4' : 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>
                {estPro ? '✅ Membre Pro' : '🆓 Compte gratuit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '-48px auto 0', padding: '0 20px 40px' }}>

        {/* Onglets */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px', display: 'flex', gap: '4px' }}>
          {onglets.map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              style={{ flex: 1, padding: '10px 8px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: onglet === o.key ? '700' : '500', background: onglet === o.key ? '#f0f2f5' : 'transparent', color: onglet === o.key ? '#1a1a2e' : '#6b7280', transition: 'all 0.18s', transform: 'none' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: message.includes('✅') ? '#E1F5EE' : '#FCEBEB', border: `1px solid ${message.includes('✅') ? '#9FE1CB' : '#F09595'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: message.includes('✅') ? '#085041' : '#A32D2D', fontWeight: '500' }}>
            {message}
          </div>
        )}

        {/* APERÇU */}
        {onglet === 'apercu' && (
          <div className="animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { val: niveau, label: 'Niveau estimé', couleur: couleurNiveau, sub: 'TCF général' },
                { val: `${tauxReussite}%`, label: 'Taux de réussite', couleur: '#378ADD', sub: `${stats?.totalQuestions || 0} questions` },
                { val: stats?.bonnesReponses || 0, label: 'Bonnes réponses', couleur: '#1D9E75', sub: 'au total' }
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: s.couleur, lineHeight: 1, marginBottom: '6px' }}>{s.val}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '2px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Activité récente */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🕐 Activité récente</h3>
              {stats?.totalQuestions > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sections.filter(s => stats?.sections?.[s.key]?.total > 0).map((s, i) => {
                    const sec = stats.sections[s.key];
                    const taux = Math.round((sec.bonnes / sec.total) * 100);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '10px' }}>
                        <div style={{ width: '36px', height: '36px', background: s.couleur + '20', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{s.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{s.label}</div>
                          <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${taux}%`, background: s.couleur, borderRadius: '4px' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: s.couleur }}>{taux}%</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{sec.total} qst</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>📚</div>
                  <p style={{ fontSize: '14px' }}>Vous n'avez pas encore fait d'exercices</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROGRESSION */}
        {onglet === 'progression' && (
          <div className="animate-fade">
            <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>📈 Progression par compétence</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sections.map((s, i) => {
                  const sec = stats?.sections?.[s.key] || { total: 0, bonnes: 0 };
                  const taux = sec.total > 0 ? Math.round((sec.bonnes / sec.total) * 100) : 0;
                  const accessible = s.key === 'comprehension-ecrite' || s.key === 'comprehension-orale' || estPro;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{s.emoji}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>{s.label}</span>
                          {!accessible && <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>🔒 Pro</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{sec.bonnes}/{sec.total}</span>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: accessible ? s.couleur : '#d1d5db' }}>{taux}%</span>
                        </div>
                      </div>
                      <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${taux}%`, background: accessible ? s.couleur : '#e5e7eb', borderRadius: '8px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Objectif */}
            <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43)', borderRadius: '14px', padding: '22px', color: '#fff' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>🎯 Objectif TCF</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {['A2', 'B1', 'B2', 'C1'].map(n => (
                  <div key={n} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: '10px', background: niveau === n ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${niveau === n ? 'rgba(29,158,117,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: niveau === n ? '#4ECDA4' : 'rgba(255,255,255,0.5)' }}>{n}</div>
                    {niveau === n && <div style={{ fontSize: '10px', color: '#4ECDA4', marginTop: '2px' }}>Niveau actuel</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COMPTE */}
        {onglet === 'compte' && (
          <div className="animate-fade">
            {/* Modifier nom */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>👤 Informations personnelles</h3>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom complet</label>
                {modifNom ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} style={inputStyle} />
                    <button onClick={sauvegarderNom} disabled={chargement} style={{ padding: '11px 16px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      {chargement ? '...' : 'Sauver'}
                    </button>
                    <button onClick={() => setModifNom(false)} style={{ padding: '11px 16px', background: '#f3f4f6', color: '#444', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: '#f9fafb', borderRadius: '10px', border: '1.5px solid #e5e7eb' }}>
                    <span style={{ fontSize: '14px' }}>{utilisateur.nom}</span>
                    <button onClick={() => setModifNom(true)} style={{ fontSize: '12px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', transform: 'none' }}>
                      Modifier
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                <div style={{ padding: '11px 14px', background: '#f9fafb', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#9ca3af' }}>
                  {utilisateur.email} <span style={{ fontSize: '11px', marginLeft: '8px' }}>(non modifiable)</span>
                </div>
              </div>
            </div>

            {/* Changer mot de passe */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🔒 Changer le mot de passe</h3>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mot de passe actuel</label>
                <input type="password" value={ancienMDP} onChange={e => setAncienMDP(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nouveau mot de passe</label>
                <input type="password" value={nouveauMDP} onChange={e => setNouveauMDP(e.target.value)} placeholder="6 caractères minimum" style={inputStyle} />
              </div>
              <button onClick={changerMotDePasse} disabled={chargement} style={{ width: '100%', padding: '13px', background: chargement ? '#e5e7eb' : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: chargement ? '#9ca3af' : '#fff', border: 'none', borderRadius: '10px', cursor: chargement ? 'default' : 'pointer', fontSize: '14px', fontWeight: '700' }}>
                {chargement ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </div>
          </div>
        )}

        {/* ABONNEMENT */}
        {onglet === 'abonnement' && (
          <div className="animate-fade">
            <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>💳 Mon abonnement</h3>

              <div style={{ background: estPro ? 'linear-gradient(135deg, #0f2027, #203a43)' : '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: estPro ? 'none' : '1.5px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: estPro ? '#fff' : '#1a1a2e', marginBottom: '4px' }}>
                      {estPro ? '⭐ Plan Pro' : '🆓 Plan Gratuit'}
                    </div>
                    <div style={{ fontSize: '13px', color: estPro ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
                      {estPro
                        ? `Plan ${utilisateur.plan || 'mensuel'} — Toutes fonctionnalités incluses`
                        : 'Compréhension écrite et orale uniquement'}
                    </div>
                    {estPro && utilisateur.dateFinAbonnement && (
                      <div style={{ fontSize: '12px', color: '#4ECDA4', marginTop: '6px', fontWeight: '600' }}>
                        ✅ Actif jusqu'au {new Date(utilisateur.dateFinAbonnement).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '36px' }}>{estPro ? '✅' : '🔓'}</div>
                </div>
              </div>

              {!estPro && (
                <button onClick={onTarifs} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 14px rgba(29,158,117,0.3)' }}>
                  ⭐ Passer à la version Pro →
                </button>
              )}

              {estPro && (
                <div style={{ background: '#E1F5EE', borderRadius: '10px', padding: '14px 16px' }}>
                  <p style={{ fontSize: '13px', color: '#0F6E56', fontWeight: '600', marginBottom: '8px' }}>✅ Fonctionnalités incluses dans votre plan :</p>
                  {['Compréhension écrite et orale illimitées', 'Expression écrite avec correction IA', 'Expression orale avec correction IA', 'Simulateur d\'examen complet (4 épreuves)', 'Explications IA après chaque réponse'].map((f, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#085041', marginBottom: '4px' }}>✓ {f}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profil;