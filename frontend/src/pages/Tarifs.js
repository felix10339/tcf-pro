import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import Icone from '../components/Icone';
import { useDeviseLocale, DEVISES_PROPOSEES } from '../data/devises';

const PLANS = [
  { id: 'mensuel', label: 'Mensuel', montant: 6.99, prix: '6,99', periode: 'par mois', parMois: null, tag: null, economie: null },
  { id: 'trimestriel', label: 'Trimestriel', montant: 17.49, prix: '17,49', periode: 'tous les 3 mois', parMois: '5,83', tag: 'Populaire', economie: 'Économisez 17 %' },
  { id: 'annuel', label: 'Annuel', montant: 55.99, prix: '55,99', periode: 'par an', parMois: '4,67', tag: 'Meilleur prix', economie: 'Économisez 33 %' }
];

// Reflète ce que l'application fait réellement aujourd'hui.
const COMPARAISON = [
  { label: 'Compréhension écrite (questions de A1 à C2)', gratuit: true, pro: true },
  { label: 'Compréhension orale avec audio', gratuit: true, pro: true },
  { label: 'Explication personnalisée par IA après chaque réponse', gratuit: false, pro: true },
  { label: 'Expression écrite : 3 tâches corrigées par IA, note /20', gratuit: false, pro: true },
  { label: 'Expression orale : 3 tâches corrigées par IA, note /20', gratuit: false, pro: true },
  { label: 'Examen blanc complet au format officiel', gratuit: false, pro: true },
  { label: 'Résultat converti en NCLC', gratuit: false, pro: true }
];

const Coche = ({ oui }) => oui
  ? <Icone nom="coche" taille={18} style={{ color: 'var(--succes)' }} titre="Inclus" />
  : <span className="texte-3" aria-label="Non inclus">—</span>;

function Tarifs({ utilisateur, onRetour }) {
  const [planChoisi, setPlanChoisi] = useState('trimestriel');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const estPro = utilisateur?.abonnement === 'pro';
  const plan = PLANS.find(p => p.id === planChoisi);
  const { devise, setDevise, convertir, disponible } = useDeviseLocale();

  const redirecterVersStripe = async () => {
    setChargement(true);
    setErreur('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_URL + '/api/paiement/creer-session',
        { plan: planChoisi },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Erreur Stripe:', err);
      setErreur('Impossible d\'ouvrir la page de paiement. Réessayez dans quelques instants.');
      setChargement(false);
    }
  };

  return (
    <div>
      <header className="entete-page centre">
        <div className="conteneur-etroit" style={{ position: 'relative', zIndex: 1 }}>
          <button className="btn btn-lien btn-petit" onClick={onRetour} style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
            <Icone nom="retour" taille={16} /> Retour
          </button>
          <h1 className="titre-1" style={{ marginBottom: 10 }}>Passez à TCF Pro</h1>
          <p style={{ opacity: 0.75, maxWidth: 480, margin: '0 auto' }}>Examens blancs complets, corrections par IA et résultats en NCLC pour arriver prêt au TCF Canada.</p>
          {estPro && <span className="badge badge-succes" style={{ marginTop: 16 }}><Icone nom="coche" taille={13} /> Vous êtes déjà membre Pro</span>}
        </div>
      </header>

      <main className="conteneur chevauche" style={{ maxWidth: 960, paddingBottom: 56 }}>
        {/* Forfaits */}
        <div className="grille grille-3" role="radiogroup" aria-label="Choix du forfait" style={{ marginBottom: 24, alignItems: 'stretch' }}>
          {PLANS.map(p => {
            const choisi = planChoisi === p.id;
            return (
              <button key={p.id} role="radio" aria-checked={choisi} onClick={() => setPlanChoisi(p.id)} className="carte carte-cliquable"
                style={{ padding: 24, position: 'relative', textAlign: 'left', border: choisi ? '2px solid var(--action)' : '1px solid var(--bordure)', boxShadow: choisi ? 'var(--ombre-2)' : 'var(--ombre-1)' }}>
                <div className="ligne entre" style={{ marginBottom: 14, minHeight: 24 }}>
                  <span className="titre-3">{p.label}</span>
                  {p.tag && <span className={`badge ${p.tag === 'Populaire' ? 'badge-action' : 'badge-nuit'}`}>{p.tag}</span>}
                </div>
                <div className="ligne gap-1" style={{ alignItems: 'baseline' }}>
                  <span className="chiffres" style={{ fontFamily: 'var(--police-titre)', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1 }}>{p.prix} $</span>
                  <span className="petit texte-3">CAD</span>
                </div>
                {convertir(p.montant) && (
                  <div className="gras" style={{ marginTop: 6, color: 'var(--action)' }}>≈ {convertir(p.montant)}</div>
                )}
                <div className="petit texte-3" style={{ marginTop: 4, marginBottom: 14 }}>{p.periode}{p.parMois ? ` · soit ${p.parMois} $/mois` : ''}</div>
                <div className="ligne entre">
                  {p.economie ? <span className="badge badge-succes">{p.economie}</span> : <span />}
                  <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%', border: choisi ? '6px solid var(--action)' : '2px solid var(--bordure-forte)', transition: 'all var(--anim)' }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Équivalent en monnaie locale */}
        {disponible && (
          <div className="ligne entre envelopper gap-2 petit" style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--bordure)', borderRadius: 'var(--rayon)' }}>
            <label htmlFor="devise" className="ligne gap-2">
              <span className="texte-2">Afficher l'équivalent en</span>
              <select id="devise" className="champ" style={{ width: 'auto', minHeight: 38, padding: '6px 10px' }}
                value={devise || ''} onChange={e => setDevise(e.target.value)}>
                <option value="">— aucun (CAD seulement)</option>
                {devise && !DEVISES_PROPOSEES.some(([c]) => c === devise) && <option value={devise}>{devise}</option>}
                {DEVISES_PROPOSEES.map(([code, nom]) => <option key={code} value={code}>{nom}</option>)}
              </select>
            </label>
            <span className="tres-petit texte-3" style={{ maxWidth: 420 }}>
              Vous êtes facturé en dollars canadiens. L'équivalent est indicatif : votre banque applique son propre taux et peut ajouter des frais de conversion. Taux : <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>ExchangeRate-API</a>.
            </span>
          </div>
        )}

        {!estPro && (
          <div className="carte" style={{ marginBottom: 24, padding: 'clamp(20px, 3vw, 28px)' }}>
            <button className="btn btn-primaire btn-grand btn-plein" onClick={redirecterVersStripe} disabled={chargement}>
              {chargement ? 'Redirection vers le paiement…' : <>Choisir le forfait {plan.label.toLowerCase()} · {plan.prix} $ <Icone nom="fleche" taille={18} /></>}
            </button>
            {erreur && <div className="message-erreur" role="alert" style={{ marginTop: 12 }}>{erreur}</div>}
            <div className="ligne envelopper gap-3 tres-petit texte-3" style={{ justifyContent: 'center', marginTop: 14 }}>
              <span className="ligne gap-1"><Icone nom="bouclier" taille={14} /> Paiement sécurisé par Stripe</span>
              <span className="ligne gap-1"><Icone nom="croix" taille={14} /> Annulable à tout moment</span>
              <span className="ligne gap-1"><Icone nom="carte" taille={14} /> Prix en dollars canadiens</span>
            </div>
          </div>
        )}

        {/* Comparatif */}
        <div className="carte" style={{ padding: 0, overflow: 'hidden' }}>
          <h2 className="titre-2" style={{ padding: '20px 24px', borderBottom: '1px solid var(--bordure)' }}>Gratuit ou Pro ?</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="petit texte-3" style={{ textAlign: 'left' }}>
                <th style={{ padding: '12px 24px', fontWeight: 600 }}>Fonctionnalité</th>
                <th style={{ padding: '12px 12px', fontWeight: 600, textAlign: 'center', width: 90 }}>Gratuit</th>
                <th style={{ padding: '12px 24px 12px 12px', fontWeight: 700, textAlign: 'center', width: 90, color: 'var(--action)' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARAISON.map(f => (
                <tr key={f.label} style={{ borderTop: '1px solid var(--bordure)' }}>
                  <td className="petit" style={{ padding: '13px 24px' }}>{f.label}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'center' }}><Coche oui={f.gratuit} /></td>
                  <td style={{ padding: '13px 24px 13px 12px', textAlign: 'center', background: 'rgba(29,78,216,0.04)' }}><Coche oui={f.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Tarifs;
