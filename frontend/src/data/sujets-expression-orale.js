// Sujets d'expression orale au format TCF Canada (3 tâches, environ 12 minutes au total).
// Tâche 1 : entretien dirigé (2 min, sans préparation)
// Tâche 2 : exercice en interaction (5 min 30 dont 2 min de préparation, soit 3 min 30 de parole)
// Tâche 3 : expression d'un point de vue (4 min 30, sans préparation)

const sujets = [
  // ——— Tâche 1 : entretien dirigé ———
  {
    id: 1, numeroTache: 1, niveau: 'A2', preparation: 0,
    tache: 'Tâche 1 — Entretien dirigé',
    sujet: 'L\'examinateur vous pose des questions sur vous : présentez-vous (nom, pays d\'origine, famille), parlez de votre travail ou de vos études, de vos loisirs et de la raison pour laquelle vous souhaitez vivre au Canada.',
    duree: 120,
    conseils: ['Faites des phrases complètes', 'Donnez des détails personnels concrets', 'Utilisez des connecteurs : d\'abord, ensuite, enfin'],
    points: ['Présentation', 'Vocabulaire du quotidien', 'Correction grammaticale', 'Fluidité']
  },
  {
    id: 2, numeroTache: 1, niveau: 'A2', preparation: 0,
    tache: 'Tâche 1 — Entretien dirigé',
    sujet: 'Parlez de votre quotidien : décrivez une journée typique (travail, transport, repas), ce que vous faites la fin de semaine, et ce que vous aimez ou n\'aimez pas dans votre ville.',
    duree: 120,
    conseils: ['Utilisez le présent', 'Exprimez vos goûts (j\'aime, je préfère, je déteste)', 'Donnez des exemples précis'],
    points: ['Description du quotidien', 'Expression des goûts', 'Organisation du discours', 'Prononciation']
  },

  // ——— Tâche 2 : exercice en interaction ———
  {
    id: 3, numeroTache: 2, niveau: 'B1', preparation: 120,
    tache: 'Tâche 2 — Exercice en interaction',
    sujet: 'Vous voulez louer un appartement à Gatineau. L\'examinateur joue le rôle du propriétaire. Posez-lui des questions pour obtenir toutes les informations utiles : prix, ce qui est inclus (chauffé, éclairé), quartier, transport, date de disponibilité, animaux, stationnement…',
    duree: 210,
    conseils: ['Saluez et présentez la situation', 'Variez les formes de questions (est-ce que, inversion, mots interrogatifs)', 'Réagissez aux réponses et relancez', 'Concluez poliment (visite, prochaine étape)'],
    points: ['Pertinence des questions', 'Variété des structures interrogatives', 'Interaction et réactivité', 'Politesse et registre']
  },
  {
    id: 4, numeroTache: 2, niveau: 'B1', preparation: 120,
    tache: 'Tâche 2 — Exercice en interaction',
    sujet: 'Vous souhaitez inscrire votre enfant dans une école francophone de Toronto. L\'examinateur joue le rôle de la secrétaire de l\'école. Posez-lui des questions sur l\'inscription : documents à fournir, horaires, service de garde, transport scolaire, activités parascolaires.',
    duree: 210,
    conseils: ['Expliquez votre situation au début', 'Posez des questions précises et variées', 'Demandez des précisions si une réponse n\'est pas claire'],
    points: ['Pertinence des questions', 'Structures interrogatives', 'Interaction', 'Vocabulaire scolaire']
  },
  {
    id: 5, numeroTache: 2, niveau: 'B2', preparation: 120,
    tache: 'Tâche 2 — Exercice en interaction',
    sujet: 'Un ami qui vit au Canada depuis 10 ans vous propose de travailler dans son entreprise à Moncton. L\'examinateur joue le rôle de cet ami. Posez-lui des questions pour décider si vous acceptez : poste, salaire, conditions de travail, coût de la vie, vie en français à Moncton, climat, écoles.',
    duree: 210,
    conseils: ['Montrez votre intérêt et vos hésitations', 'Comparez avec votre situation actuelle', 'Demandez des exemples concrets', 'Concluez en donnant votre décision'],
    points: ['Richesse des questions', 'Capacité à relancer', 'Expression de l\'hésitation et du doute', 'Aisance']
  },

  // ——— Tâche 3 : expression d'un point de vue ———
  {
    id: 6, numeroTache: 3, niveau: 'B2', preparation: 0,
    tache: 'Tâche 3 — Point de vue',
    sujet: '« Pour bien s\'intégrer au Canada, il est plus important de trouver rapidement un emploi que de parfaitement maîtriser le français ou l\'anglais. » Êtes-vous d\'accord ? Donnez votre opinion et défendez-la avec des arguments et des exemples.',
    duree: 270,
    conseils: ['Annoncez clairement votre position', 'Développez 2 ou 3 arguments', 'Illustrez avec des exemples personnels', 'Envisagez l\'avis contraire puis concluez'],
    points: ['Prise de position', 'Qualité de l\'argumentation', 'Exemples', 'Cohérence et connecteurs']
  },
  {
    id: 7, numeroTache: 3, niveau: 'B2', preparation: 0,
    tache: 'Tâche 3 — Point de vue',
    sujet: '« Les réseaux sociaux aident les nouveaux arrivants à s\'intégrer dans leur pays d\'accueil. » Qu\'en pensez-vous ? Justifiez votre point de vue.',
    duree: 270,
    conseils: ['Nuancez : avantages et limites', 'Donnez des exemples concrets', 'Concluez par une synthèse'],
    points: ['Prise de position', 'Nuance', 'Exemples', 'Fluidité']
  },
  {
    id: 8, numeroTache: 3, niveau: 'C1', preparation: 0,
    tache: 'Tâche 3 — Point de vue',
    sujet: '« Les gouvernements devraient obliger les employeurs à reconnaître les diplômes obtenus à l\'étranger. » Partagez-vous cet avis ? Développez une argumentation structurée et nuancée.',
    duree: 270,
    conseils: ['Structurez : introduction, arguments, contre-arguments, conclusion', 'Utilisez un vocabulaire précis et un registre soutenu', 'Proposez des solutions concrètes'],
    points: ['Structure', 'Argumentation nuancée', 'Richesse lexicale', 'Correction grammaticale']
  },
  {
    id: 9, numeroTache: 3, niveau: 'C1', preparation: 0,
    tache: 'Tâche 3 — Point de vue',
    sujet: '« Vivre dans un pays bilingue est une richesse, mais cela menace à long terme la langue minoritaire. » Que pensez-vous de cette affirmation, en vous appuyant sur la situation du français au Canada ?',
    duree: 270,
    conseils: ['Définissez les enjeux', 'Appuyez-vous sur des exemples canadiens (Québec, Acadie, Ontario…)', 'Évitez les généralisations et nuancez'],
    points: ['Compréhension des enjeux', 'Argumentation', 'Exemples pertinents', 'Aisance']
  }
];

export default sujets;
