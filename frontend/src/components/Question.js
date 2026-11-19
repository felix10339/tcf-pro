import AudioPlayer from './AudioPlayer';
import ImageDocument from './ImageDocument';
import { NIVEAU_COULEUR } from '../data/tcfCanada';

function Question({ question, onReponse, reponseSelectionnee, valide }) {
  const estOral = question.section === 'comprehension-orale';
  const texteAudio = question.audio_texte || question.texte;

  const classe = index => {
    if (valide && index === question.correct) return 'choix juste';
    if (valide && index === reponseSelectionnee) return 'choix faux';
    if (!valide && index === reponseSelectionnee) return 'choix selectionne';
    return 'choix';
  };

  return (
    <div>
      {question.niveau && (
        <span className="badge" style={{ color: NIVEAU_COULEUR[question.niveau], marginBottom: 14 }}>Niveau {question.niveau}</span>
      )}

      {estOral ? (
        <div style={{ marginBottom: 18 }}>
          {question.audio_texte && question.texte && <p className="etiquette" style={{ marginBottom: 8 }}>{question.texte}</p>}
          {question.image && <div style={{ marginBottom: 12 }}><ImageDocument src={question.image} alt="Image de la question" /></div>}
          <AudioPlayer texte={texteAudio} />
        </div>
      ) : question.image ? (
        <div style={{ marginBottom: 18 }}>
          <p className="etiquette" style={{ marginBottom: 8 }}>Document · {question.texte}</p>
          <ImageDocument src={question.image} alt={question.texte} />
        </div>
      ) : (
        <div className="document" style={{ marginBottom: 18 }}>
          <p className="etiquette" style={{ marginBottom: 8 }}>Document</p>
          <p>{question.texte}</p>
        </div>
      )}

      <p className="gras" style={{ fontSize: '1.05rem', marginBottom: 14 }}>{question.question}</p>

      <div className="pile" style={{ gap: 10 }} role="radiogroup">
        {question.options.map((option, index) => (
          <button key={index} role="radio" aria-checked={reponseSelectionnee === index} disabled={valide}
            className={classe(index)} onClick={() => onReponse(index)}>
            <span className="choix-lettre">{String.fromCharCode(65 + index)}</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Question;
