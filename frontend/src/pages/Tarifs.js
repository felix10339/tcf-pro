import { useState } from 'react';
import axios from 'axios';

function Tarifs({ utilisateur, onRetour }) {
  const [planChoisi, setPlanChoisi] = useState('mensuel');
  const [chargement, setChargement] = useState(false);

  const estPro = utilisateur?.abonnement === 'pro';

  const plans = [
    { id: 'mensuel', label: 'Mensuel', prix: '9.99', devise: 'CAD', periode: 'mois', tag: null, economie: null },
    { id: 'trimestriel', label: 'Trimestriel', prix: '24.99', devise: 'CAD', periode: '3 mois', tag: 'Populaire', economie: 'Économisez 17%' },
    { id: 'annuel', label: 'Annuel', prix: '79.99', devise: 'CAD', periode: 'an', tag: 'Meilleur prix', economie: 'Économisez 33%' }
  ];

  const fonctionnalites = [
    { label: 'Questions illimitées', gratuit: '20/jour', pro: '✅ Illimité' },
    { label: 'Compréhension écrite', gratuit: '✅', pro: '✅' },
    { label: 'Compréhension orale (audio)', gratuit: '✅', pro: '✅' },
    { label: 'Expression écrite + correction IA', gratuit: '3/mois', pro: '✅ Illimité' },
    { label: 'Expression orale + correction IA', gratuit: '3/mois', pro: '✅ Illimité' },
    { label: 'Simulateur d\'examen complet', gratuit: '1/semaine', pro: '✅ Illimité' },
    { label: 'Générateur de questions IA', gratuit: '❌', pro: '✅ Inclus' },
    { label: 'Explications IA après chaque réponse', gratuit: '❌', pro: '✅ Inclus' },
    { label: 'Suivi de progression détaillé', gratuit: '❌', pro: '✅ Inclus' },
    { label: 'Support prioritaire', gratuit: '❌', pro: '✅ Inclus' }
  ];

  const planSelectionne = plans.find(p => p.id === planChoisi);

  const redirecterVersStripe = async () => {
    setChargement(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/paiement/creer-session',
        { plan: planChoisi },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert('Erreur lors de la création de la session de paiement.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', padding: '40px 32px 80px', color: '#fff', textAlign: 'center', position: 'relative' }}>
        <button onClick={onRetour} style={{ position: 'absolute', left: '28px', top: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px' }}>← Retour</button>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Passez à TCFPro</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
          Débloquez toutes les fonctionnalités et maximisez vos chances de réussite au TCF
        </p>
        {estPro && (
          <div style={{ display: 'inline-block', marginTop: '16px', background: '#1D9E75', borderRadius: '20px', padding: '6px 20px', fontSize: '13px', fontWeight: '700' }}>
            ✅ Vous êtes déjà abonné Pro
          </div>
        )}
      </div>

      <div style={{ maxWidth: '900px', margin: '-48px auto 0', padding: '0 20px 40px' }}>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setPlanChoisi(plan.id)}
              style={{ background: '#fff', borderRadius: '16px', padding: '24px', cursor: 'pointer', border: planChoisi === plan.id ? '2px solid #1D9E75' : '2px solid transparent', boxShadow: planChoisi === plan.id ? '0 8px 30px rgba(29,158,117,0.15)' : '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s', textAlign: 'center', position: 'relative' }}>
              {plan.tag && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: plan.tag === 'Meilleur prix' ? '#EF9F27' : '#1D9E75', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                  {plan.tag}
                </div>
              )}
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>{plan.label}</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: planChoisi === plan.id ? '#1D9E75' : '#1a1a2e', lineHeight: 1 }}>
                {plan.prix}<span style={{ fontSize: '14px', fontWeight: '500', color: '#aaa' }}> {plan.devise}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px', marginBottom: '12px' }}>par {plan.periode}</div>
              {plan.economie && (
                <div style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', display: 'inline-block' }}>
                  {plan.economie}
                </div>
              )}
              {planChoisi === plan.id && <div style={{ marginTop: '12px', color: '#1D9E75', fontSize: '18px' }}>✓</div>}
            </div>
          ))}
        </div>

        {/* Tableau comparatif */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>Comparer les plans</h3>
          <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div style={{ padding: '12px 16px', background: '#f9fafb', fontWeight: '700', fontSize: '13px', borderBottom: '1px solid #eee' }}>Fonctionnalité</div>
              <div style={{ padding: '12px 16px', background: '#f9fafb', fontWeight: '700', fontSize: '13px', textAlign: 'center', borderBottom: '1px solid #eee', color: '#888' }}>Gratuit</div>
              <div style={{ padding: '12px 16px', background: '#E1F5EE', fontWeight: '700', fontSize: '13px', textAlign: 'center', borderBottom: '1px solid #eee', color: '#0F6E56' }}>Pro ✨</div>
              {fonctionnalites.map((f, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div style={{ padding: '11px 16px', fontSize: '13px', color: '#444', borderBottom: i < fonctionnalites.length - 1 ? '1px solid #f5f5f5' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>{f.label}</div>
                  <div style={{ padding: '11px 16px', fontSize: '13px', textAlign: 'center', color: '#888', borderBottom: i < fonctionnalites.length - 1 ? '1px solid #f5f5f5' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>{f.gratuit}</div>
                  <div style={{ padding: '11px 16px', fontSize: '13px', textAlign: 'center', color: '#0F6E56', fontWeight: '500', borderBottom: i < fonctionnalites.length - 1 ? '1px solid #f5f5f5' : 'none', background: i % 2 === 0 ? '#F0FBF7' : '#E8F8F2' }}>{f.pro}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {!estPro && (
          <>
            <button onClick={redirecterVersStripe} disabled={chargement}
              style={{ width: '100%', padding: '16px', background: chargement ? '#ccc' : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', borderRadius: '12px', cursor: chargement ? 'default' : 'pointer', fontSize: '16px', fontWeight: '800', boxShadow: '0 4px 20px rgba(29,158,117,0.35)' }}>
              {chargement ? '⏳ Redirection vers le paiement...' : `Commencer avec le plan ${planSelectionne?.label} — ${planSelectionne?.prix} ${planSelectionne?.devise} →`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '12px' }}>
              🔒 Paiement sécurisé par Stripe · Annulation à tout moment · Satisfait ou remboursé 7 jours
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Tarifs;