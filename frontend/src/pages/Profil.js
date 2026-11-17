import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import Icone from '../components/Icone';

const SECTIONS = [
  { key: 'comprehension-orale', label: 'Compréhension orale', icone: 'casque', couleur: 'var(--co)' },
  { key: 'comprehension-ecrite', label: 'Compréhension écrite', icone: 'livre', couleur: 'var(--ce)' },
  { key: 'expression-ecrite', label: 'Expression écrite', icone: 'stylo', couleur: 'var(--ee)' },
  { key: 'expression-orale', label: 'Expression orale', icone: 'micro', couleur: 'var(--eo)' }
];

const ONGLETS = [
  { key: 'apercu', label: 'Aperçu' },
  { key: 'progression', label: 'Progression' },
  { key: 'compte', label: 'Mon compte' },
  { key: 'abonnement', label: 'Abonnement' }
];

const AVANTAGES_PRO = [
  'Examen blanc complet au format officiel, avec résultat en NCLC',
  'Expression écrite : 3 tâches corrigées par IA',
  'Expression orale : 3 tâches corrigées par IA',
  'Explication personnalisée par IA après chaque réponse'
];

function Profil({ utilisateur, onMisAJour, onRetour, onTarifs }) {
  const [stats, setStats] = useState(null);
  const [onglet, setOnglet] = useState('apercu');
  const [modifNom, setModifNom] = useState(false);
  const [nouveauNom, setNouveauNom] = useState(utilisateur.nom);
  const [ancienMDP, setAncienMDP] = useState('');
  const [nouveauMDP, setNouveauMDP] = useState('');
  const [message, setMessage] = useState(null); // { type: 'succes' | 'erreur', texte }
  const [chargement, setChargement] = useState(false);
  const [chargementPortail, setChargementPortail] = useState(false);
  const estPro = utilisateur?.abonnement === 'pro';

  const afficher = (type, texte, duree = 4000) => {
    setMessage({ type, texte });
    setTimeout(() => setMessage(null), duree);
  };

  // Ouvre le portail client Stripe (carte, factures, changement de forfait, annulation)
  const ouvrirPortail = async () => {
    setChargementPortail(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/paiement/portail`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.href = res.data.url;
    } catch (err) {
      afficher('erreur', err.response?.data?.message || 'Impossible d\'ouvrir la gestion de l\'abonnement.');
      setChargementPortail(false);
    }
  };

  useEffect(() => {
    try {
      const s = localStorage.getItem(`stats-${utilisateur.id}`);
      if (s) setStats(JSON.parse(s));
    } catch { /* statistiques illisibles */ }
  }, [utilisateur.id]);

  const tauxReussite = stats?.totalQuestions > 0 ? Math.round((stats.bonnesReponses / stats.totalQuestions) * 100) : 0;
  const niveau = !stats?.totalQuestions ? '—' : tauxReussite >= 80 ? 'C1' : tauxReussite >= 60 ? 'B2' : tauxReussite >= 40 ? 'B1' : 'A2';

  const sauvegarderNom = async () => {
    if (!nouveauNom.trim()) return;
    setChargement(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/auth/modifier-profil`, { nom: nouveauNom }, { headers: { Authorization: `Bearer ${token}` } });
      const u = { ...utilisateur, nom: nouveauNom };
      localStorage.setItem('utilisateur', JSON.stringify(u));
      onMisAJour(u);
      setModifNom(false);
      afficher('succes', 'Votre nom a été modifié.');
    } catch {
      afficher('erreur', 'La modification n\'a pas pu être enregistrée.');
    } finally {
      setChargement(false);
    }
  };

  const changerMotDePasse = async (e) => {
    e?.preventDefault();
    if (!ancienMDP || !nouveauMDP) { afficher('erreur', 'Remplissez les deux champs.'); return; }
    if (nouveauMDP.length < 6) { afficher('erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères.'); return; }
    setChargement(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/auth/changer-mot-de-passe`,
        { ancienMotDePasse: ancienMDP, nouveauMotDePasse: nouveauMDP },
        { headers: { Authorization: `Bearer ${token}` } });
      setAncienMDP(''); setNouveauMDP('');
      afficher('succes', 'Votre mot de passe a été modifié.');
    } catch (err) {
      afficher('erreur', err.response?.data?.message || 'Le changement de mot de passe a échoué.');
    } finally {
      setChargement(false);
    }
  };

  const dateFin = utilisateur.dateFinAbonnement
    ? new Date(utilisateur.dateFinAbonnement).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div>
      <header className="entete-page">
        <div className="conteneur" style={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
          <button className="btn btn-lien btn-petit" onClick={onRetour} style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 14, paddingLeft: 0 }}>
            <Icone nom="retour" taille={16} /> Tableau de bord
          </button>
          <div className="ligne gap-3">
            <span className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem', background: 'var(--action)' }}>{utilisateur.nom.charAt(0).toUpperCase()}</span>
            <div style={{ minWidth: 0 }}>
              <h1 className="titre-1" style={{ marginBottom: 2 }}>{utilisateur.nom}</h1>
              <p className="petit" style={{ opacity: 0.7, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>{utilisateur.email}</p>
              <span className={`badge ${estPro ? 'badge-succes' : ''}`} style={estPro ? undefined : { background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                {estPro ? <><Icone nom="etoile" taille={12} /> Membre Pro</> : 'Compte gratuit'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="conteneur chevauche" style={{ maxWidth: 860, paddingBottom: 56 }}>
        <div className="carte" style={{ padding: '0 12px', marginBottom: 20 }}>
          <nav className="onglets" style={{ borderBottom: 'none' }} role="tablist">
            {ONGLETS.map(o => (
              <button key={o.key} role="tab" aria-selected={onglet === o.key} className={`onglet${onglet === o.key ? ' actif' : ''}`} onClick={() => setOnglet(o.key)}>{o.label}</button>
            ))}
          </nav>
        </div>

        {message && (
          <div className={message.type === 'succes' ? 'encadre encadre-succes' : 'message-erreur'} role="status" style={{ marginBottom: 16 }}>
            <Icone nom={message.type === 'succes' ? 'coche' : 'croix'} taille={16} style={{ flexShrink: 0, marginTop: 2 }} /> {message.texte}
          </div>
        )}

        {/* ——— Aperçu ——— */}
        {onglet === 'apercu' && (
          <div className="pile gap-3 apparaitre">
            <div className="grille grille-3">
              {[
                { val: niveau, label: 'Niveau indicatif', sous: 'selon vos exercices' },
                { val: `${tauxReussite} %`, label: 'Taux de réussite', sous: `${stats?.totalQuestions || 0} questions` },
                { val: stats?.bonnesReponses || 0, label: 'Bonnes réponses', sous: 'au total' }
              ].map(s => (
                <div key={s.label} className="carte centre">
                  <div className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 }}>{s.val}</div>
                  <div className="gras petit" style={{ marginTop: 4 }}>{s.label}</div>
                  <div className="tres-petit texte-3">{s.sous}</div>
                </div>
              ))}
            </div>
            <div className="carte">
              <h2 className="titre-3" style={{ marginBottom: 14 }}>Activité récente</h2>
              {stats?.totalQuestions > 0 ? (
                <div className="pile gap-2">
                  {SECTIONS.filter(s => stats?.sections?.[s.key]?.total > 0).map(s => {
                    const sec = stats.sections[s.key];
                    const taux = Math.round((sec.bonnes / sec.total) * 100);
                    return (
                      <div key={s.key} className="ligne gap-3" style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--rayon-sm)' }}>
                        <span className="pastille-icone" style={{ width: 36, height: 36, background: 'var(--surface)', color: s.couleur }}><Icone nom={s.icone} taille={17} /></span>
                        <div style={{ flex: 1 }}>
                          <div className="gras petit" style={{ marginBottom: 6 }}>{s.label}</div>
                          <div className="progression"><div style={{ width: `${taux}%`, background: s.couleur }} /></div>
                        </div>
                        <div className="centre"><div className="gras chiffres">{taux} %</div><div className="tres-petit texte-3">{sec.total} questions</div></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="centre texte-3" style={{ padding: 24 }}>Vous n'avez pas encore fait d'exercices.</p>
              )}
            </div>
          </div>
        )}

        {/* ——— Progression ——— */}
        {onglet === 'progression' && (
          <div className="pile gap-3 apparaitre">
            <div className="carte">
              <h2 className="titre-3" style={{ marginBottom: 18 }}>Progression par compétence</h2>
              <div className="pile gap-4" style={{ gap: 22 }}>
                {SECTIONS.map(s => {
                  const sec = stats?.sections?.[s.key] || { total: 0, bonnes: 0 };
                  const taux = sec.total > 0 ? Math.round((sec.bonnes / sec.total) * 100) : 0;
                  const accessible = s.key.startsWith('comprehension') || estPro;
                  return (
                    <div key={s.key}>
                      <div className="ligne entre" style={{ marginBottom: 8 }}>
                        <span className="ligne gap-2 gras">
                          <span style={{ color: s.couleur, display: 'inline-flex' }}><Icone nom={s.icone} taille={18} /></span>{s.label}
                          {!accessible && <span className="badge badge-alerte"><Icone nom="cadenas" taille={11} /> Pro</span>}
                        </span>
                        <span className="ligne gap-2"><span className="petit texte-3 chiffres">{sec.bonnes}/{sec.total}</span><strong className="chiffres">{taux} %</strong></span>
                      </div>
                      <div className="progression" style={{ height: 8 }}><div style={{ width: `${taux}%`, background: accessible ? s.couleur : 'var(--bordure-forte)' }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="carte carte-nuit">
              <h2 className="titre-3" style={{ marginBottom: 14, color: '#fff' }}>Niveau indicatif</h2>
              <div className="grille grille-4" style={{ gap: 8 }}>
                {['A2', 'B1', 'B2', 'C1'].map(n => (
                  <div key={n} className="centre" style={{ padding: '12px 8px', borderRadius: 'var(--rayon-sm)', background: niveau === n ? 'var(--action)' : 'rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: 'var(--police-titre)', fontSize: '1.3rem', fontWeight: 700, opacity: niveau === n ? 1 : 0.5 }}>{n}</div>
                    {niveau === n && <div className="tres-petit">Niveau actuel</div>}
                  </div>
                ))}
              </div>
              <p className="petit" style={{ opacity: 0.7, marginTop: 12 }}>Pour connaître votre NCLC, passez un examen blanc complet.</p>
            </div>
          </div>
        )}

        {/* ——— Mon compte ——— */}
        {onglet === 'compte' && (
          <div className="pile gap-3 apparaitre">
            <div className="carte pile gap-3">
              <h2 className="titre-3">Informations personnelles</h2>
              <div className="champ-groupe">
                <label className="champ-label" htmlFor="nom-profil">Nom complet</label>
                {modifNom ? (
                  <div className="ligne gap-2 envelopper">
                    <input id="nom-profil" className="champ" style={{ flex: '1 1 220px' }} value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} autoComplete="name" />
                    <button className="btn btn-nuit" onClick={sauvegarderNom} disabled={chargement}>{chargement ? '…' : 'Enregistrer'}</button>
                    <button className="btn btn-contour" onClick={() => { setModifNom(false); setNouveauNom(utilisateur.nom); }}>Annuler</button>
                  </div>
                ) : (
                  <div className="champ ligne entre" style={{ background: 'var(--surface-2)' }}>
                    <span>{utilisateur.nom}</span>
                    <button className="btn-lien gras" style={{ background: 'none', border: 'none', color: 'var(--action)' }} onClick={() => setModifNom(true)}>Modifier</button>
                  </div>
                )}
              </div>
              <div className="champ-groupe">
                <span className="champ-label">Adresse courriel</span>
                <div className="champ texte-3" style={{ background: 'var(--surface-2)' }}>{utilisateur.email} <span className="tres-petit">(non modifiable)</span></div>
              </div>
            </div>

            <form className="carte pile gap-3" onSubmit={changerMotDePasse}>
              <h2 className="titre-3">Changer le mot de passe</h2>
              <input type="text" name="username" autoComplete="username" value={utilisateur.email} readOnly hidden />
              <div className="champ-groupe">
                <label className="champ-label" htmlFor="mdp-actuel">Mot de passe actuel</label>
                <input id="mdp-actuel" className="champ" type="password" autoComplete="current-password" value={ancienMDP} onChange={e => setAncienMDP(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="champ-groupe">
                <label className="champ-label" htmlFor="mdp-nouveau">Nouveau mot de passe</label>
                <input id="mdp-nouveau" className="champ" type="password" autoComplete="new-password" value={nouveauMDP} onChange={e => setNouveauMDP(e.target.value)} placeholder="6 caractères minimum" />
              </div>
              <button type="submit" className="btn btn-nuit btn-plein" disabled={chargement}>{chargement ? 'Modification…' : 'Changer le mot de passe'}</button>
            </form>
          </div>
        )}

        {/* ——— Abonnement ——— */}
        {onglet === 'abonnement' && (
          <div className="pile gap-3 apparaitre">
            <div className={`carte${estPro ? ' carte-nuit' : ''}`}>
              <div className="ligne entre gap-3 envelopper">
                <div>
                  <p className="etiquette" style={{ color: estPro ? 'rgba(255,255,255,0.6)' : undefined, marginBottom: 4 }}>Votre forfait</p>
                  <h2 className="titre-2" style={{ color: estPro ? '#fff' : undefined }}>{estPro ? `TCF Pro · ${utilisateur.plan || 'mensuel'}` : 'Gratuit'}</h2>
                  <p className="petit" style={{ opacity: 0.75, marginTop: 4 }}>
                    {estPro ? (dateFin ? `Période en cours jusqu'au ${dateFin}` : 'Toutes les fonctionnalités incluses') : 'Compréhension écrite et orale'}
                  </p>
                </div>
                {estPro
                  ? <button className="btn btn-clair" onClick={ouvrirPortail} disabled={chargementPortail}>{chargementPortail ? 'Ouverture…' : 'Gérer mon abonnement'}</button>
                  : <button className="btn btn-primaire" onClick={onTarifs}>Passer Pro <Icone nom="fleche" taille={16} /></button>}
              </div>
              {estPro && <p className="tres-petit" style={{ opacity: 0.6, marginTop: 14 }}>Carte bancaire, factures, changement de forfait ou annulation, sur la page sécurisée de Stripe.</p>}
            </div>

            <div className="carte">
              <h2 className="titre-3" style={{ marginBottom: 12 }}>{estPro ? 'Inclus dans votre forfait' : 'Ce que débloque le forfait Pro'}</h2>
              <ul className="pile gap-2" style={{ listStyle: 'none' }}>
                {AVANTAGES_PRO.map(a => (
                  <li key={a} className="ligne gap-2" style={{ alignItems: 'flex-start' }}>
                    <Icone nom={estPro ? 'coche' : 'cadenas'} taille={16} style={{ flexShrink: 0, marginTop: 3, color: estPro ? 'var(--succes)' : 'var(--texte-3)' }} />
                    <span className="texte-2">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profil;
