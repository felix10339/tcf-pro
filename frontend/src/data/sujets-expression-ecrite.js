// Sujets d'expression écrite au format TCF Canada (3 tâches, 60 minutes au total).
// Tâche 1 : message (60–120 mots) · Tâche 2 : article / récit (120–150 mots) · Tâche 3 : argumentation à partir de 2 documents (120–180 mots)

const sujets = [
  // ——— Tâche 1 : message ———
  {
    id: 1, numeroTache: 1, niveau: 'A2',
    tache: 'Tâche 1 — Message',
    sujet: 'Vous venez d\'emménager dans un appartement à Montréal. Écrivez un message à vos nouveaux voisins pour vous présenter et les inviter à prendre un café chez vous samedi prochain.',
    consignes: ['Présentez-vous (nom, origine, situation)', 'Précisez le jour, l\'heure et le lieu', 'Demandez-leur de confirmer leur présence'],
    minMots: 60, maxMots: 120
  },
  {
    id: 2, numeroTache: 1, niveau: 'B1',
    tache: 'Tâche 1 — Message',
    sujet: 'Le chauffage de votre logement ne fonctionne plus depuis trois jours et il fait -20 °C dehors. Écrivez un courriel à votre propriétaire pour décrire le problème et lui demander une intervention rapide.',
    consignes: ['Décrivez le problème et depuis quand il dure', 'Expliquez les conséquences pour vous', 'Demandez une solution et un délai précis', 'Restez poli et formel'],
    minMots: 60, maxMots: 120
  },
  {
    id: 3, numeroTache: 1, niveau: 'B1',
    tache: 'Tâche 1 — Message',
    sujet: 'Vous avez vu une annonce pour un poste de préposé(e) au service à la clientèle dans une entreprise de Québec. Écrivez un courriel à la responsable du recrutement pour demander des précisions sur l\'horaire, le salaire et la langue de travail.',
    consignes: ['Indiquez où vous avez vu l\'annonce', 'Présentez brièvement votre profil', 'Posez vos questions clairement'],
    minMots: 60, maxMots: 120
  },
  {
    id: 4, numeroTache: 1, niveau: 'A2',
    tache: 'Tâche 1 — Message',
    sujet: 'Votre collègue vous a invité(e) à son souper d\'anniversaire, mais vous ne pouvez pas y aller. Écrivez-lui un message pour vous excuser, expliquer pourquoi et proposer une autre activité ensemble.',
    consignes: ['Remerciez pour l\'invitation', 'Expliquez la raison de votre absence', 'Proposez une autre date ou activité'],
    minMots: 60, maxMots: 120
  },

  // ——— Tâche 2 : article / récit ———
  {
    id: 5, numeroTache: 2, niveau: 'B1',
    tache: 'Tâche 2 — Article ou récit',
    sujet: 'Le journal de votre quartier publie une série d\'articles intitulée « Mon premier hiver au Canada ». Racontez votre expérience (ou celle d\'un proche) : surprises, difficultés, bons moments et conseils aux nouveaux arrivants.',
    consignes: ['Racontez des faits précis au passé', 'Décrivez vos impressions et émotions', 'Terminez par des conseils pratiques'],
    minMots: 120, maxMots: 150
  },
  {
    id: 6, numeroTache: 2, niveau: 'B2',
    tache: 'Tâche 2 — Article ou récit',
    sujet: 'Vous avez participé à une activité de bénévolat dans votre communauté (banque alimentaire, accueil de nouveaux arrivants, nettoyage d\'un parc…). Écrivez un article pour le bulletin de votre municipalité afin de raconter cette expérience et d\'encourager d\'autres personnes à s\'engager.',
    consignes: ['Présentez l\'organisme et l\'activité', 'Racontez un moment marquant', 'Expliquez ce que cette expérience vous a apporté', 'Invitez les lecteurs à participer'],
    minMots: 120, maxMots: 150
  },
  {
    id: 7, numeroTache: 2, niveau: 'B1',
    tache: 'Tâche 2 — Article ou récit',
    sujet: 'Un site Web pour nouveaux arrivants vous demande de raconter votre recherche de logement au Canada. Décrivez les étapes, les difficultés rencontrées et ce qui vous a finalement aidé(e).',
    consignes: ['Organisez votre récit de façon chronologique', 'Utilisez le passé composé et l\'imparfait', 'Donnez votre opinion sur l\'expérience'],
    minMots: 120, maxMots: 150
  },
  {
    id: 8, numeroTache: 2, niveau: 'B2',
    tache: 'Tâche 2 — Article ou récit',
    sujet: 'Vous avez assisté à une fête ou un festival au Canada (Fête nationale du Québec, fête du Canada, Festival acadien, Carnaval de Québec…). Écrivez un article pour un blogue de voyage pour décrire l\'événement et partager vos impressions.',
    consignes: ['Décrivez le lieu, l\'ambiance et les activités', 'Exprimez vos sentiments', 'Recommandez (ou non) l\'événement en justifiant'],
    minMots: 120, maxMots: 150
  },

  // ——— Tâche 3 : argumentation à partir de deux documents ———
  {
    id: 9, numeroTache: 3, niveau: 'B2',
    tache: 'Tâche 3 — Argumentation',
    sujet: 'Le télétravail doit-il devenir la norme ? Lisez les deux opinions ci-dessous, puis rédigez un texte pour un forum en ligne : présentez brièvement les deux points de vue, puis donnez votre opinion argumentée.',
    documents: [
      'Document 1 — « Depuis que je travaille de la maison, je gagne deux heures par jour de transport. Je suis plus productive et je vois davantage mes enfants. » (Karine, analyste à Laval)',
      'Document 2 — « Le télétravail isole les employés, surtout les nouveaux arrivants, qui ont besoin du bureau pour créer un réseau et pratiquer leur français. » (Marc, gestionnaire à Ottawa)'
    ],
    consignes: ['Résumez les deux positions en quelques lignes', 'Donnez votre opinion clairement', 'Justifiez-la avec des arguments et un exemple', 'Utilisez des connecteurs (cependant, en revanche, ainsi…)'],
    minMots: 120, maxMots: 180
  },
  {
    id: 10, numeroTache: 3, niveau: 'B2',
    tache: 'Tâche 3 — Argumentation',
    sujet: 'Faut-il rendre le transport en commun gratuit dans les grandes villes ? Lisez les deux documents, puis rédigez un texte qui compare ces points de vue et présente votre position.',
    documents: [
      'Document 1 — « La gratuité inciterait les gens à laisser leur voiture, réduirait la pollution et aiderait les familles à faible revenu. » (Un groupe environnemental)',
      'Document 2 — « La gratuité coûterait des millions aux contribuables. Il vaut mieux investir dans la fréquence et la fiabilité du service. » (Une économiste)'
    ],
    consignes: ['Présentez les deux points de vue', 'Prenez position', 'Appuyez votre opinion sur des exemples concrets'],
    minMots: 120, maxMots: 180
  },
  {
    id: 11, numeroTache: 3, niveau: 'C1',
    tache: 'Tâche 3 — Argumentation',
    sujet: 'Les immigrants devraient-ils s\'installer en région plutôt que dans les grandes villes ? Lisez les deux documents, puis rédigez un texte argumenté pour le courrier des lecteurs d\'un journal.',
    documents: [
      'Document 1 — « En région, les nouveaux arrivants trouvent des emplois, des logements abordables et une communauté qui les accueille à bras ouverts. » (Un maire d\'une ville de 15 000 habitants)',
      'Document 2 — « Sans transport en commun, sans communauté culturelle ni reconnaissance des diplômes, beaucoup d\'immigrants s\'y sentent isolés et repartent vers Montréal ou Toronto. » (Une chercheuse en sociologie)'
    ],
    consignes: ['Comparez les deux positions de façon nuancée', 'Développez au moins deux arguments personnels', 'Proposez une conclusion ou une solution'],
    minMots: 120, maxMots: 180
  },
  {
    id: 12, numeroTache: 3, niveau: 'C1',
    tache: 'Tâche 3 — Argumentation',
    sujet: 'Faut-il interdire les cellulaires à l\'école ? Lisez les deux documents, puis rédigez un texte qui présente ces points de vue et défend votre opinion.',
    documents: [
      'Document 1 — « Depuis l\'interdiction du cellulaire en classe, nos élèves sont plus concentrés et les conflits entre jeunes ont diminué. » (Une directrice d\'école secondaire)',
      'Document 2 — « Le cellulaire est un outil d\'apprentissage. Plutôt que de l\'interdire, il faut apprendre aux jeunes à l\'utiliser de façon responsable. » (Un enseignant)'
    ],
    consignes: ['Présentez les deux positions', 'Prenez position de façon argumentée', 'Utilisez un registre soutenu et des connecteurs variés'],
    minMots: 120, maxMots: 180
  }
];

export default sujets;
