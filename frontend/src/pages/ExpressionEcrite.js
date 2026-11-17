import { useState } from 'react';
import axios from 'axios';
import sujets from '../data/sujets-expression-ecrite';
import API_URL from '../config';
import { NIVEAU_COULEUR } from '../data/tcfCanada';
import EntetePage from '../components/EntetePage';
import CarteCorrection from '../components/CarteCorrection';
import Icone from '../components/Icone';
import { STRUCTURES } from '../data/conseils';

const TACHES = [1, 2, 3];
const NOM_TACHE = { 1: 'Message', 2: 'Article ou récit', 3: 'Argumentation' };

function ExpressionEcrite({ onRetour }) {
  const [phase, setPhase] = useState('choix');
  const [sujetChoisi, setSujetChoisi] = useState(null);
  const [redaction, setRedaction] = useState('');
  const [chargement, setChargement] = useState(false);
  const [correction, setCorrection] = useState(null);
  const [erreur, setErreur] = useState('');

  const compterMots = (texte) => texte.trim().split(/\s+/).filter(m => m.length > 0).length;

  const soumettre = async () => {
    if (!redaction.trim()) return;
    setChargement(true);
    setErreur('');
    try {
      const token = localStorage.getItem('token');
      const sujetComplet = sujetChoisi.documents
        ? `${sujetChoisi.sujet}\n${sujetChoisi.documents.join('\n')}`
        : sujetChoisi.sujet;
      const res = await axios.post(`${API_URL}/api/ia/corriger-redaction`, {
        tache: sujetChoisi.tache,
        sujet: sujetComplet,
        redaction,
        niveau: sujetChoisi.niveau,
        minMots: sujetChoisi.minMots,
        maxMots: sujetChoisi.maxMots
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCorrection(res.data);
      setPhase('correction');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setErreur(err.response?.data?.message || 'La correction n\'a pas pu être effectuée. Réessayez dans quelques instants.');
    } finally {
      setChargement(false);
    }
  };

  const nbMots = compterMots(redaction);
  const motsSuffisants = nbMots >= (sujetChoisi?.minMots || 0);
  const motsTropLongs = nbMots > (sujetChoisi?.maxMots || 999);

  // ——— Choix du sujet ———
  if (phase === 'choix') return (
    <div>
      <EntetePage titre="Expression écrite" sousTitre="Choisissez un sujet au format du TCF Canada. L'IA note votre texte sur 20 et vous donne votre équivalence NCLC." onRetour={onRetour} />
      <main className="conteneur chevauche" style={{ maxWidth: 960, paddingBottom: 56 }}>
        <div className="encadre encadre-info carte" style={{ marginBottom: 24, border: 'none' }}>
          <Icone nom="stylo" taille={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--action)' }} />
          <p><strong>Au TCF Canada :</strong> 3 tâches en 60 minutes. Tâche 1 : message (60 à 120 mots). Tâche 2 : article ou récit (120 à 150 mots). Tâche 3 : argumentation à partir de deux documents (120 à 180 mots).</p>
        </div>
        {TACHES.map(n => (
          <section key={n} style={{ marginBottom: 28 }}>
            <h2 className="titre-3" style={{ marginBottom: 12 }}>
              Tâche {n} · {NOM_TACHE[n]}
            </h2>
            <div className="grille grille-2">
              {sujets.filter(s => s.numeroTache === n).map(s => (
                <button key={s.id} className="carte carte-cliquable pile" style={{ gap: 10 }} onClick={() => { setSujetChoisi(s); setRedaction(''); setPhase('redaction'); window.scrollTo(0, 0); }}>
                  <div className="ligne entre">
                    <span className="etiquette">{s.minMots} à {s.maxMots} mots</span>
                    <span className="badge" style={{ color: NIVEAU_COULEUR[s.niveau] }}>{s.niveau}</span>
                  </div>
                  <p className="texte-2" style={{ lineHeight: 1.6 }}>{s.sujet}</p>
                  <span className="ligne gap-1 petit gras" style={{ color: 'var(--action)', marginTop: 'auto' }}>Choisir ce sujet <Icone nom="fleche" taille={14} /></span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );

  // ——— Rédaction ———
  if (phase === 'redaction') return (
    <div>
      <EntetePage surTitre={`${sujetChoisi.tache} · Niveau ${sujetChoisi.niveau}`} titre="Rédigez votre texte" onRetour={() => setPhase('choix')} libelleRetour="Changer de sujet" />
      <main className="conteneur chevauche" style={{ maxWidth: 820, paddingBottom: 56 }}>
        <div className="carte" style={{ marginBottom: 16 }}>
          <p className="etiquette" style={{ marginBottom: 8 }}>Sujet</p>
          <p style={{ lineHeight: 1.7, marginBottom: sujetChoisi.documents ? 12 : 0 }}>{sujetChoisi.sujet}</p>
          {sujetChoisi.documents && sujetChoisi.documents.map((d, i) => (
            <p key={i} className="document" style={{ marginTop: 10, borderLeft: '3px solid var(--ee)' }}>{d}</p>
          ))}
          <div className="encadre encadre-info" style={{ marginTop: 16 }}>
            <Icone nom="coche" taille={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <ul className="pile" style={{ gap: 2, listStyle: 'none' }}>{sujetChoisi.consignes.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
          {STRUCTURES.ecrit[sujetChoisi.numeroTache] && (
            <details style={{ marginTop: 12 }}>
              <summary className="petit gras" style={{ cursor: 'pointer', color: 'var(--action)' }}>{STRUCTURES.ecrit[sujetChoisi.numeroTache].titre}</summary>
              <ol className="pile gap-1 petit texte-2" style={{ marginTop: 10, paddingLeft: 20 }}>
                {STRUCTURES.ecrit[sujetChoisi.numeroTache].etapes.map((e, i) => <li key={i}>{e}</li>)}
              </ol>
            </details>
          )}
        </div>

        <div className="carte" style={{ marginBottom: 16 }}>
          <label htmlFor="redaction" className="sr-only">Votre texte</label>
          <textarea id="redaction" className="zone-texte" value={redaction} onChange={e => setRedaction(e.target.value)} placeholder="Rédigez votre texte ici…" />
          <div className="ligne entre gap-3" style={{ marginTop: 12 }}>
            <span className="petit gras chiffres" style={{ color: motsTropLongs ? 'var(--erreur)' : motsSuffisants ? 'var(--succes)' : 'var(--texte-3)' }}>
              {nbMots} mot{nbMots > 1 ? 's' : ''} / {sujetChoisi.minMots}–{sujetChoisi.maxMots}
              {motsSuffisants && !motsTropLongs ? ' ✓' : ''}{motsTropLongs ? ' (trop long)' : ''}
            </span>
            <div className="progression" style={{ width: 140 }}>
              <div style={{ width: `${Math.min((nbMots / sujetChoisi.maxMots) * 100, 100)}%`, background: motsTropLongs ? 'var(--erreur)' : motsSuffisants ? 'var(--succes)' : 'var(--ee)' }} />
            </div>
          </div>
        </div>

        {erreur && <div className="message-erreur" role="alert" style={{ marginBottom: 12 }}>{erreur}</div>}
        <button className="btn btn-primaire btn-grand btn-plein" onClick={soumettre} disabled={chargement || nbMots < 20}>
          {chargement ? 'Correction en cours…' : <><Icone nom="etincelle" taille={18} /> Faire corriger par l'IA</>}
        </button>
        {nbMots < 20 && <p className="centre tres-petit texte-3" style={{ marginTop: 8 }}>Écrivez au moins 20 mots pour obtenir une correction.</p>}
      </main>
    </div>
  );

  // ——— Correction ———
  if (phase === 'correction' && correction) return (
    <div>
      <EntetePage surTitre={sujetChoisi.tache} titre="Votre correction" onRetour={onRetour} />
      <main className="conteneur chevauche" style={{ maxWidth: 820, paddingBottom: 56 }}>
        <CarteCorrection correction={correction} section="expression-ecrite" />
        <div className="ligne envelopper gap-2" style={{ marginTop: 20 }}>
          <button className="btn btn-primaire" style={{ flex: '1 1 160px' }} onClick={() => { setRedaction(''); setCorrection(null); setPhase('redaction'); }}>Réécrire ce sujet</button>
          <button className="btn btn-contour" style={{ flex: '1 1 160px' }} onClick={() => { setPhase('choix'); setRedaction(''); setCorrection(null); }}>Autre sujet</button>
          <button className="btn btn-contour" style={{ flex: '1 1 160px' }} onClick={onRetour}>Tableau de bord</button>
        </div>
      </main>
    </div>
  );

  return null;
}

export default ExpressionEcrite;
