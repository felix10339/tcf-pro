// Importe la banque de questions TCF Canada (data/questions-canada.json) dans Supabase.
//
//   node scripts/importer-questions.js              → aperçu seulement, rien n'est écrit
//   node scripts/importer-questions.js --ecrire     → ajoute les questions absentes (aucune suppression)
//   node scripts/importer-questions.js --ecrire --remplacer
//                                                   → SUPPRIME d'abord toutes les questions de compréhension, puis importe
//
// Les questions déjà présentes (même section + même question + même texte) ne sont jamais dupliquées.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const nouvelles = require('../data/questions-canada.json');

const ecrire = process.argv.includes('--ecrire');
const remplacer = process.argv.includes('--remplacer');
const SECTIONS = ['comprehension-ecrite', 'comprehension-orale'];

async function main() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { data: existantes, error } = await supabase.from('questions').select('id, section, question, texte');
  if (error) throw error;
  console.log(`Questions actuellement en base : ${existantes.length}`);
  console.log(`Questions dans le fichier       : ${nouvelles.length}`);

  if (remplacer) {
    const aSupprimer = existantes.filter(q => SECTIONS.includes(q.section));
    console.log(`${ecrire ? 'Suppression' : 'Seraient supprimées'} : ${aSupprimer.length} questions de compréhension`);
    if (ecrire && aSupprimer.length) {
      const { error: errSup } = await supabase.from('questions').delete().in('id', aSupprimer.map(q => q.id));
      if (errSup) throw errSup;
    }
  }

  const cle = q => `${q.section}|${q.question}|${q.texte}`;
  const dejaLa = new Set(remplacer ? existantes.filter(q => !SECTIONS.includes(q.section)).map(cle) : existantes.map(cle));
  const aAjouter = nouvelles.filter(q => !dejaLa.has(cle(q)));
  console.log(`${ecrire ? 'Ajout' : 'Seraient ajoutées'} : ${aAjouter.length} questions`);

  if (!ecrire) {
    console.log('\nAperçu seulement. Relancez avec --ecrire pour enregistrer.');
    return;
  }
  if (aAjouter.length) {
    const lignes = aAjouter.map(q => ({
      section: q.section, niveau: q.niveau, texte: q.texte, question: q.question,
      options: q.options, correct: q.correct, explication: q.explication, audio_texte: q.audio_texte || null
    }));
    const { error: errAjout } = await supabase.from('questions').insert(lignes);
    if (errAjout) throw errAjout;
  }
  console.log('✅ Import terminé.');
}

main().catch(err => { console.error('❌', err.message || err); process.exit(1); });
