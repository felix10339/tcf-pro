// Format officiel du TCF Canada et conversion des scores en NCLC.
// Source de référence : France Éducation international (format) et IRCC (équivalences NCLC).
// ⚠️ Vérifier ces barèmes sur canada.ca avant chaque mise en ligne : IRCC peut les modifier.

export const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const NIVEAU_COULEUR = {
  A1: '#6B7280', A2: '#A86400', B1: '#12784A', B2: '#1F5FBF', C1: '#5B4FC4', C2: '#3D2F9E'
};

// Répartition des 39 questions d'une épreuve de compréhension, de la plus facile à la plus difficile.
export const REPARTITION_COMPREHENSION = { A1: 4, A2: 6, B1: 10, B2: 10, C1: 6, C2: 3 };

export const EPREUVES = [
  {
    key: 'comprehension-orale', label: 'Compréhension orale', emoji: '🎧', couleur: '#12784A',
    type: 'qcm', dureeMinutes: 35, nbQuestions: 39, bareme: '/699'
  },
  {
    key: 'comprehension-ecrite', label: 'Compréhension écrite', emoji: '📖', couleur: '#1F5FBF',
    type: 'qcm', dureeMinutes: 60, nbQuestions: 39, bareme: '/699'
  },
  {
    key: 'expression-ecrite', label: 'Expression écrite', emoji: '✍️', couleur: '#A86400',
    type: 'redaction', dureeMinutes: 60, nbTaches: 3, bareme: '/20'
  },
  {
    key: 'expression-orale', label: 'Expression orale', emoji: '🎤', couleur: '#A3275B',
    type: 'oral', dureeMinutes: 12, nbTaches: 3, bareme: '/20'
  }
];

// Les 3 tâches officielles d'expression écrite (60 minutes au total).
export const TACHES_EE = [
  { numero: 1, nom: 'Message', description: 'Écrire un message pour décrire, raconter ou expliquer (courriel, invitation, note).', minMots: 60, maxMots: 120 },
  { numero: 2, nom: 'Article ou récit', description: 'Rédiger un article, un récit ou un courrier pour raconter une expérience et donner ses impressions.', minMots: 120, maxMots: 150 },
  { numero: 3, nom: 'Argumentation', description: 'Comparer deux points de vue présentés dans deux documents, puis donner et justifier son opinion.', minMots: 120, maxMots: 180 }
];

// Les 3 tâches officielles d'expression orale (environ 12 minutes au total).
export const TACHES_EO = [
  { numero: 1, nom: 'Entretien dirigé', description: 'Répondre à des questions sur vous-même (sans préparation).', preparationSecondes: 0, dureeSecondes: 120 },
  // 5 min 30 au total, dont 2 min de préparation → 3 min 30 de parole.
  { numero: 2, nom: 'Exercice en interaction', description: 'Obtenir des informations en posant des questions à l\'examinateur (2 min de préparation, puis 3 min 30 d\'échange).', preparationSecondes: 120, dureeSecondes: 210 },
  { numero: 3, nom: 'Expression d\'un point de vue', description: 'Donner et défendre votre opinion sur un sujet (sans préparation).', preparationSecondes: 0, dureeSecondes: 270 }
];

// Équivalences TCF Canada → NCLC. Chaque ligne : [score minimum, NCLC].
const TABLE_NCLC = {
  'comprehension-orale': [[549, 10], [523, 9], [503, 8], [458, 7], [398, 6], [369, 5], [331, 4]],
  'comprehension-ecrite': [[549, 10], [524, 9], [499, 8], [453, 7], [406, 6], [375, 5], [342, 4]],
  'expression-ecrite': [[16, 10], [14, 9], [12, 8], [10, 7], [7, 6], [6, 5], [4, 4]],
  'expression-orale': [[16, 10], [14, 9], [12, 8], [10, 7], [7, 6], [6, 5], [4, 4]]
};

// Renvoie le NCLC (4 à 10) pour un score, ou 0 si le score est sous NCLC 4.
export function scoreVersNCLC(section, score) {
  const ligne = (TABLE_NCLC[section] || []).find(([min]) => score >= min);
  return ligne ? ligne[1] : 0;
}

// Score minimum à atteindre pour obtenir un NCLC donné (null si inconnu).
export function scorePourNCLC(section, nclc) {
  const ligne = (TABLE_NCLC[section] || []).find(([, n]) => n === nclc);
  return ligne ? ligne[0] : null;
}

export function libelleNCLC(nclc) {
  if (!nclc) return 'Sous NCLC 4';
  return nclc >= 10 ? 'NCLC 10+' : `NCLC ${nclc}`;
}

// Niveau CECR correspondant à un score de compréhension sur 699.
export function scoreVersCECR(score) {
  if (score >= 600) return 'C2';
  if (score >= 500) return 'C1';
  if (score >= 400) return 'B2';
  if (score >= 300) return 'B1';
  if (score >= 200) return 'A2';
  if (score >= 100) return 'A1';
  return '< A1';
}

// Estimation du score /699 d'une épreuve de compréhension.
// Comme au vrai TCF, les questions difficiles « valent » plus : on additionne le taux de réussite
// de chaque niveau (A1 → C2). Réussir tout jusqu'au B1 ≈ 350 (B1), tout jusqu'au B2 ≈ 466 (B2), tout ≈ 699.
// C'est une ESTIMATION pédagogique, pas un score officiel.
export function estimerScoreComprehension(questions, reponses) {
  const parNiveau = {};
  questions.forEach((q, i) => {
    const n = parNiveau[q.niveau] || (parNiveau[q.niveau] = { total: 0, justes: 0 });
    n.total += 1;
    if (reponses[i] === q.correct) n.justes += 1;
  });
  const sommeTaux = NIVEAUX.reduce((acc, niv) => {
    const n = parNiveau[niv];
    return acc + (n && n.total ? n.justes / n.total : 0);
  }, 0);
  return Math.min(699, Math.round(sommeTaux * (699 / NIVEAUX.length)));
}

// Sélectionne les questions d'une épreuve selon la répartition officielle, triées du plus facile au plus difficile.
// S'il manque des questions d'un niveau, on complète avec les niveaux voisins.
export function selectionnerQuestions(toutes, nbQuestions = 39) {
  const melanger = arr => [...arr].sort(() => Math.random() - 0.5);
  const parNiveau = {};
  NIVEAUX.forEach(n => { parNiveau[n] = melanger(toutes.filter(q => q.niveau === n)); });

  const choisies = [];
  NIVEAUX.forEach(n => {
    choisies.push(...parNiveau[n].splice(0, REPARTITION_COMPREHENSION[n]));
  });
  // Compléter si la banque est incomplète
  const reste = melanger(NIVEAUX.flatMap(n => parNiveau[n]));
  while (choisies.length < nbQuestions && reste.length) choisies.push(reste.shift());

  return choisies
    .slice(0, nbQuestions)
    .sort((a, b) => NIVEAUX.indexOf(a.niveau) - NIVEAUX.indexOf(b.niveau));
}
