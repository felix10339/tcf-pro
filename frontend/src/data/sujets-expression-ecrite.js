const sujets = [
  {
    id: 1,
    niveau: 'B1',
    tache: 'Tâche 1 — Message pratique',
    sujet: 'Vous avez commandé un article en ligne mais il ne correspond pas à votre commande. Écrivez un message au service client pour expliquer le problème et demander une solution.',
    consignes: ['Décrivez le problème clairement', 'Demandez une solution précise', 'Soyez poli et formel'],
    minMots: 60,
    maxMots: 80
  },
  {
    id: 2,
    niveau: 'B1',
    tache: 'Tâche 1 — Courriel',
    sujet: 'Vous souhaitez vous inscrire à un cours de français dans une école de langues. Écrivez un courriel pour demander des informations sur les horaires, les tarifs et le niveau requis.',
    consignes: ['Présentez-vous brièvement', 'Posez vos questions clairement', 'Terminez poliment'],
    minMots: 60,
    maxMots: 90
  },
  {
    id: 3,
    niveau: 'B2',
    tache: 'Tâche 2 — Article d\'opinion',
    sujet: 'Les réseaux sociaux ont-ils plus d\'effets positifs que négatifs sur la société ? Donnez votre opinion en développant des arguments et des exemples.',
    consignes: ['Donnez votre position clairement', 'Utilisez au moins deux arguments', 'Donnez des exemples concrets'],
    minMots: 160,
    maxMots: 180
  },
  {
    id: 4,
    niveau: 'B2',
    tache: 'Tâche 2 — Texte argumentatif',
    sujet: 'Certains pensent que le travail à distance (télétravail) est l\'avenir du monde professionnel. D\'autres pensent qu\'il nuit aux relations entre collègues. Quelle est votre opinion ?',
    consignes: ['Présentez les deux points de vue', 'Donnez votre position personnelle', 'Illustrez avec des exemples'],
    minMots: 150,
    maxMots: 180
  },
  {
    id: 5,
    niveau: 'C1',
    tache: 'Tâche 3 — Essai argumenté',
    sujet: 'La place de la langue française dans le monde est-elle menacée par la domination de l\'anglais ? Développez votre point de vue de manière structurée.',
    consignes: ['Structurez votre essai (intro, développement, conclusion)', 'Nuancez votre propos', 'Utilisez un vocabulaire riche et varié'],
    minMots: 200,
    maxMots: 250
  }
];

export default sujets;