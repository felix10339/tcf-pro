import AudioPlayer from './AudioPlayer';

function Question({ question, onReponse, reponseSelectionnee, valide }) {
  const estOral = question.section === 'comprehension-orale';
  const texteAudio = question.audio_texte || question.texte;

  return (
    <div>
      {/* Audio player pour compréhension orale */}
      {estOral && <AudioPlayer texte={texteAudio} />}

      {/* Contexte texte pour compréhension écrite */}
      {!estOral && (
        <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>📄 Texte</p>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>{question.texte}</p>
        </div>
      )}

      <p style={{ fontWeight: '600', marginBottom: '14px', fontSize: '15px' }}>{question.question}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((option, index) => {
          let couleur = '#fff';
          let bordure = '1.5px solid #e8e8e8';
          let texteCouleur = '#1a1a2e';

          if (valide) {
            if (index === question.correct) {
              couleur = '#E1F5EE';
              bordure = '1.5px solid #1D9E75';
              texteCouleur = '#085041';
            } else if (index === reponseSelectionnee) {
              couleur = '#FCEBEB';
              bordure = '1.5px solid #E24B4A';
              texteCouleur = '#7B1A1A';
            }
          } else if (index === reponseSelectionnee) {
            couleur = '#E6F1FB';
            bordure = '1.5px solid #378ADD';
            texteCouleur = '#0C447C';
          }

          return (
            <button
              key={index}
              onClick={() => !valide && onReponse(index)}
              style={{
                padding: '13px 16px',
                background: couleur,
                border: bordure,
                borderRadius: '10px',
                textAlign: 'left',
                cursor: valide ? 'default' : 'pointer',
                fontSize: '14px',
                color: texteCouleur,
                fontWeight: index === reponseSelectionnee || (valide && index === question.correct) ? '500' : '400',
                transition: 'all 0.15s'
              }}
            >
              <span style={{
                display: 'inline-block', width: '24px', height: '24px',
                background: valide && index === question.correct ? '#1D9E75' : valide && index === reponseSelectionnee ? '#E24B4A' : index === reponseSelectionnee ? '#378ADD' : '#eee',
                borderRadius: '50%', textAlign: 'center', lineHeight: '24px',
                fontSize: '12px', color: '#fff', marginRight: '10px',
                fontWeight: '700', flexShrink: 0
              }}>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Question;