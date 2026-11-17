// Guide de méthode TCF Canada : stratégies, structures types, expressions utiles et objectifs NCLC.
// Contenu pédagogique : à faire relire par un enseignant ou un examinateur avant publication large.

// ——— Stratégies par épreuve ———
export const STRATEGIES = {
  generale: {
    titre: 'Stratégie générale',
    icone: 'cible',
    intro: 'Le TCF Canada ne se réussit pas seulement avec un bon niveau : il se réussit avec une méthode. Ces principes valent pour les 4 épreuves.',
    sections: [
      {
        titre: 'Avant l\'examen',
        points: [
          'Fixez votre objectif NCLC selon votre programme d\'immigration, puis entraînez-vous en priorité sur votre compétence la plus faible : IRCC regarde chaque compétence séparément.',
          'Passez au moins 2 ou 3 examens blancs complets en conditions réelles (chronomètre, sans pause, sans dictionnaire) pour habituer votre concentration à la durée.',
          'Entraînez-vous à l\'oral à voix haute, chaque jour, même 10 minutes. La fluidité vient de la répétition, pas de la lecture.',
          'Écoutez du français canadien : Radio-Canada (ICI Première), balados, bulletins de nouvelles. Vous vous habituerez aux accents et au vocabulaire d\'ici.'
        ]
      },
      {
        titre: 'Gestion du temps',
        points: [
          'En compréhension, ne restez jamais bloqué : une question difficile vaut le même effort qu\'une facile pour vous, mais pas le même temps. Avancez et revenez si possible.',
          'Ne laissez aucune question sans réponse : une réponse vide ne rapporte aucun point.',
          'En expression écrite, réservez environ 5 minutes à la fin pour relire les accords, les accents et la ponctuation.'
        ]
      },
      {
        titre: 'Le jour de l\'examen',
        points: [
          'Arrivez en avance avec la pièce d\'identité demandée dans votre convocation : sans elle, vous ne pourrez pas passer l\'examen.',
          'Dormez bien la veille : l\'examen complet dure près de 3 heures et la fatigue fait chuter les scores en fin de session.',
          'Lisez chaque consigne jusqu\'au bout : beaucoup de points se perdent sur des tâches mal comprises, pas sur le niveau de langue.'
        ]
      }
    ]
  },

  'comprehension-orale': {
    titre: 'Compréhension orale',
    icone: 'casque',
    intro: '39 questions en 35 minutes, de la plus facile (A1) à la plus difficile (C2). Chaque enregistrement n\'est diffusé qu\'une seule fois.',
    sections: [
      {
        titre: 'Méthode en 3 temps',
        points: [
          'Avant l\'écoute : lisez la question et les 4 réponses. Repérez ce que vous cherchez (une heure, un lieu, une opinion, une raison).',
          'Pendant l\'écoute : concentrez-vous sur le sens global d\'abord, puis sur l\'information demandée. Ne cherchez pas à tout comprendre mot à mot.',
          'Après l\'écoute : éliminez les réponses clairement fausses, puis choisissez. Votre première intuition est souvent la bonne.'
        ]
      },
      {
        titre: 'Les pièges classiques',
        points: [
          'Le mot entendu n\'est pas forcément la bonne réponse : les distracteurs reprennent souvent des mots exacts de l\'enregistrement.',
          'Attention aux corrections dans le dialogue : « Mardi… ah non, plutôt mercredi. » La bonne information est souvent la deuxième.',
          'Repérez la négation et la restriction : « ne… que », « ne… plus », « sauf », « seulement ».',
          'Dans les questions avancées (B2 à C2), on vous demande souvent l\'opinion ou l\'intention du locuteur, pas un fait : écoutez le ton et les mots d\'opinion.'
        ]
      },
      {
        titre: 'S\'entraîner efficacement',
        points: [
          'Écoutez un court extrait de radio, résumez-le en 2 phrases, puis réécoutez pour vérifier.',
          'Habituez-vous aux nombres (prix, horaires, numéros de téléphone) : ils reviennent dans presque toutes les questions de niveau A1-A2.'
        ]
      }
    ]
  },

  'comprehension-ecrite': {
    titre: 'Compréhension écrite',
    icone: 'livre',
    intro: '39 questions en 60 minutes. Les premiers documents sont courts (affiches, annonces), les derniers sont des textes argumentatifs complexes.',
    sections: [
      {
        titre: 'Méthode',
        points: [
          'Lisez d\'abord la question, puis le texte : vous lirez avec un objectif précis.',
          'Pour les documents courts (A1-A2), allez vite : visez moins d\'une minute par question pour garder du temps pour les textes difficiles.',
          'Pour les textes longs (C1-C2), repérez la thèse de l\'auteur : elle se trouve souvent dans la première ou la dernière phrase, ou après « mais », « pourtant », « en réalité ».'
        ]
      },
      {
        titre: 'Les pièges classiques',
        points: [
          'Une réponse peut être vraie dans la vie réelle mais absente du texte : ne répondez qu\'avec ce que le texte dit.',
          'Les mots de nuance changent tout : « souvent » n\'est pas « toujours », « certains » n\'est pas « tous ».',
          'Repérez les connecteurs d\'opposition (cependant, en revanche, toutefois) : ils signalent souvent l\'idée importante.',
          'Les reformulations : la bonne réponse dit la même chose que le texte avec d\'autres mots (« chauffé, éclairé » = « le chauffage et l\'électricité sont inclus »).'
        ]
      }
    ]
  },

  'expression-ecrite': {
    titre: 'Expression écrite',
    icone: 'stylo',
    intro: '3 tâches en 60 minutes. Les correcteurs évaluent l\'adéquation à la consigne, la cohérence, la richesse du vocabulaire et la correction de la langue.',
    sections: [
      {
        titre: 'Répartir son temps (60 minutes)',
        points: [
          'Tâche 1 (message, 60 à 120 mots) : environ 10 minutes.',
          'Tâche 2 (article ou récit, 120 à 150 mots) : environ 20 minutes.',
          'Tâche 3 (argumentation, 120 à 180 mots) : environ 25 minutes.',
          'Gardez 5 minutes pour relire les trois textes.'
        ]
      },
      {
        titre: 'Ce qui fait gagner des points',
        points: [
          'Respecter la fourchette de mots : un texte trop court est pénalisé, un texte trop long ne rapporte rien de plus.',
          'Répondre à tous les éléments de la consigne (par exemple : se présenter ET inviter ET donner la date).',
          'Adapter le registre au destinataire : « tu » pour un ami, « vous » et des formules polies pour un propriétaire ou un employeur.',
          'Organiser le texte en paragraphes et utiliser des connecteurs variés (d\'abord, ensuite, de plus, cependant, enfin).',
          'Varier les temps (présent, passé composé, imparfait, futur, conditionnel) dès que le sujet le permet.'
        ]
      },
      {
        titre: 'Les erreurs qui coûtent cher',
        points: [
          'Oublier la formule d\'ouverture ou de clôture d\'un message.',
          'Recopier les phrases de la consigne : le correcteur ne peut pas évaluer votre niveau.',
          'Les accords oubliés (participe passé, adjectifs) et les accents manquants : relisez-les spécifiquement.',
          'En tâche 3, donner son opinion sans présenter les deux documents.'
        ]
      }
    ]
  },

  'expression-orale': {
    titre: 'Expression orale',
    icone: 'micro',
    intro: '3 tâches en environ 12 minutes, face à un examinateur. On évalue la capacité à communiquer, la cohérence, le vocabulaire, la grammaire et la fluidité.',
    sections: [
      {
        titre: 'Tâche 1 : entretien dirigé (2 min, sans préparation)',
        points: [
          'Préparez à l\'avance une présentation solide : identité, pays, formation, travail, famille, loisirs, projet au Canada.',
          'Développez chaque réponse en 3 ou 4 phrases : ne répondez jamais seulement « oui » ou « non ».',
          'Donnez des détails concrets et des exemples : ils montrent votre richesse de vocabulaire.'
        ]
      },
      {
        titre: 'Tâche 2 : exercice en interaction (3 min 30 après 2 min de préparation)',
        points: [
          'Pendant la préparation, notez 8 à 10 questions couvrant tous les aspects de la situation (prix, horaires, conditions, lieu…).',
          'Variez les formes de questions : « Est-ce que… ? », l\'inversion (« Pourriez-vous… ? »), les mots interrogatifs (combien, quand, comment, pourquoi).',
          'Réagissez aux réponses de l\'examinateur (« Ah d\'accord, et dans ce cas… ? ») : c\'est une interaction, pas une liste de questions.',
          'Utilisez le conditionnel de politesse : « Je voudrais savoir », « Serait-il possible de… ? ».'
        ]
      },
      {
        titre: 'Tâche 3 : point de vue (4 min 30, sans préparation)',
        points: [
          'Annoncez clairement votre position dès le début.',
          'Développez 2 ou 3 arguments, chacun illustré par un exemple concret (idéalement tiré de votre expérience ou du Canada).',
          'Montrez que vous connaissez l\'avis contraire, puis expliquez pourquoi vous ne le partagez pas : c\'est un signe de niveau B2 et plus.',
          'Concluez en reformulant votre position.'
        ]
      },
      {
        titre: 'Pendant l\'épreuve',
        points: [
          'Si vous ne trouvez pas un mot, contournez-le (« c\'est l\'objet qui sert à… ») au lieu de vous arrêter.',
          'Si vous ne comprenez pas une question, demandez de la répéter : « Pourriez-vous reformuler, s\'il vous plaît ? ». C\'est autorisé et naturel.',
          'Parlez à un rythme posé : la clarté compte plus que la vitesse.'
        ]
      }
    ]
  }
};

// ——— Structures types des tâches d'expression ———
export const STRUCTURES = {
  ecrit: {
    1: {
      titre: 'Structure d\'un message (tâche 1)',
      etapes: [
        'Formule d\'ouverture adaptée au destinataire (« Bonjour Madame Tremblay, », « Salut Karim, »)',
        'Raison du message en une phrase (« Je vous écris pour… »)',
        'Les informations demandées par la consigne, une par phrase',
        'Une demande ou une proposition claire (« Pourriez-vous me confirmer… ? »)',
        'Formule de clôture et signature (« Au plaisir, », « Cordialement, »)'
      ]
    },
    2: {
      titre: 'Structure d\'un article ou récit (tâche 2)',
      etapes: [
        'Un titre ou une phrase d\'accroche',
        'Le contexte : quand, où, avec qui (imparfait pour décrire)',
        'Les événements dans l\'ordre (passé composé, avec « d\'abord, ensuite, puis, finalement »)',
        'Vos impressions et émotions',
        'Une conclusion : ce que vous en retenez, ou un conseil au lecteur'
      ]
    },
    3: {
      titre: 'Structure d\'une argumentation (tâche 3)',
      etapes: [
        'Introduction : présentez le sujet du débat en une phrase',
        'Document 1 : résumez sa position avec vos mots (« Selon le premier document… »)',
        'Document 2 : résumez la position opposée (« En revanche, le second… »)',
        'Votre opinion, justifiée par 1 ou 2 arguments et un exemple',
        'Conclusion : reformulez votre position, éventuellement avec une nuance'
      ]
    }
  },
  oral: {
    1: {
      titre: 'Structure de l\'entretien (tâche 1)',
      etapes: ['Identité et origine', 'Formation et parcours professionnel', 'Situation familiale et loisirs', 'Projet au Canada et motivations']
    },
    2: {
      titre: 'Structure de l\'interaction (tâche 2)',
      etapes: ['Saluer et présenter votre situation', 'Poser vos questions, des plus importantes aux plus précises', 'Réagir aux réponses et demander des précisions', 'Conclure : remercier et annoncer la suite (visite, rappel, décision)']
    },
    3: {
      titre: 'Structure du point de vue (tâche 3)',
      etapes: ['Annoncer votre position', 'Argument 1 et un exemple', 'Argument 2 et un exemple', 'L\'avis contraire et votre réponse', 'Conclusion qui reformule votre position']
    }
  }
};

// ——— Boîte à outils : expressions utiles ———
export const EXPRESSIONS = [
  {
    titre: 'Ouvrir et fermer un message',
    groupes: [
      { sous: 'Formel', items: ['Madame, Monsieur,', 'Bonjour Madame Côté,', 'Je vous prie d\'agréer mes salutations distinguées.', 'Veuillez recevoir mes meilleures salutations.', 'Cordialement,'] },
      { sous: 'Amical', items: ['Salut Julie,', 'Coucou tout le monde !', 'À bientôt,', 'Au plaisir de te voir,', 'Bisous,'] }
    ]
  },
  {
    titre: 'Organiser ses idées',
    groupes: [
      { sous: 'Ordonner', items: ['Tout d\'abord', 'Ensuite', 'Par ailleurs', 'Enfin', 'Pour conclure'] },
      { sous: 'Ajouter', items: ['De plus', 'En outre', 'Non seulement… mais aussi…'] },
      { sous: 'Opposer', items: ['Cependant', 'En revanche', 'Toutefois', 'Alors que', 'Bien que (+ subjonctif)'] },
      { sous: 'Conséquence', items: ['Donc', 'C\'est pourquoi', 'Par conséquent', 'Ainsi'] }
    ]
  },
  {
    titre: 'Donner son opinion',
    groupes: [
      { sous: 'Affirmer', items: ['À mon avis,', 'Selon moi,', 'Je suis convaincu(e) que…', 'Il me semble que…'] },
      { sous: 'Nuancer', items: ['Certes…, mais…', 'Il est vrai que…, néanmoins…', 'Dans une certaine mesure,', 'Je comprends ce point de vue, toutefois…'] },
      { sous: 'Illustrer', items: ['Par exemple,', 'Prenons le cas de…', 'C\'est notamment le cas de…'] }
    ]
  },
  {
    titre: 'Poser des questions avec politesse (tâche 2 orale)',
    groupes: [
      { sous: 'Questions', items: ['Pourriez-vous me dire… ?', 'Je voudrais savoir si…', 'Serait-il possible de… ?', 'Est-ce que le loyer comprend… ?', 'À partir de quand… ?'] },
      { sous: 'Relancer', items: ['Et si je comprends bien,…', 'D\'accord, et dans ce cas… ?', 'Pourriez-vous préciser… ?'] }
    ]
  }
];

// Vocabulaire de la vie au Canada souvent rencontré à l'examen
export const VOCABULAIRE_CANADIEN = [
  ['un 4 ½', 'un appartement de 4 pièces avec salle de bain (au Québec)'],
  ['chauffé, éclairé', 'chauffage et électricité inclus dans le loyer'],
  ['un bail', 'le contrat de location'],
  ['le dépanneur', 'la petite épicerie de quartier'],
  ['la fin de semaine', 'le week-end'],
  ['un courriel', 'un e-mail'],
  ['magasiner', 'faire les magasins'],
  ['le NAS', 'le numéro d\'assurance sociale'],
  ['une garderie / un CPE', 'un service de garde pour jeunes enfants'],
  ['la carte d\'assurance maladie', 'la carte de santé provinciale'],
  ['le 811', 'la ligne téléphonique d\'information santé'],
  ['un laissez-passer', 'un abonnement de transport en commun']
];

// ——— Objectifs NCLC selon le projet ———
// Exigences minimales générales : vérifier les conditions à jour sur canada.ca avant toute démarche.
export const OBJECTIFS_NCLC = [
  { programme: 'Travailleurs qualifiés (fédéral)', exigence: 'NCLC 7 dans les 4 compétences', detail: 'Programme d\'Entrée express pour les travailleurs qualifiés.' },
  { programme: 'Expérience canadienne', exigence: 'NCLC 7 ou NCLC 5 selon l\'emploi', detail: 'NCLC 7 pour les emplois TEER 0 et 1, NCLC 5 pour les emplois TEER 2 et 3.' },
  { programme: 'Métiers spécialisés (fédéral)', exigence: 'NCLC 5 à l\'oral, NCLC 4 à l\'écrit', detail: 'Expression et compréhension orales : 5. Expression et compréhension écrites : 4.' },
  { programme: 'Citoyenneté canadienne', exigence: 'NCLC 4 à l\'oral', detail: 'Compréhension et expression orales.' },
  { programme: 'Points supplémentaires en français', exigence: 'NCLC 7 ou plus dans les 4 compétences', detail: 'Un bon niveau en français donne des points supplémentaires dans Entrée express et ouvre des tirages réservés aux francophones.' }
];

// ——— Astuces courtes (tableau de bord) ———
export const ASTUCES = [
  { epreuve: 'Compréhension orale', texte: 'Lisez la question et les 4 réponses avant l\'écoute : vous saurez exactement quoi chercher.' },
  { epreuve: 'Compréhension orale', texte: 'Méfiez-vous des réponses qui reprennent mot pour mot l\'enregistrement : ce sont souvent des pièges.' },
  { epreuve: 'Compréhension écrite', texte: 'Pour les textes longs, la thèse de l\'auteur se cache souvent après « mais », « pourtant » ou « en réalité ».' },
  { epreuve: 'Compréhension écrite', texte: 'Ne répondez qu\'avec ce que dit le texte, même si une autre réponse vous paraît vraie dans la vie.' },
  { epreuve: 'Expression écrite', texte: 'Respectez la fourchette de mots : trop court, vous perdez des points ; trop long, vous n\'en gagnez pas.' },
  { epreuve: 'Expression écrite', texte: 'Gardez 5 minutes à la fin pour relire uniquement les accords et les accents.' },
  { epreuve: 'Expression écrite', texte: 'En tâche 3, présentez les deux documents avant de donner votre opinion.' },
  { epreuve: 'Expression orale', texte: 'Préparez dès maintenant votre présentation pour la tâche 1 : identité, parcours, famille, projet au Canada.' },
  { epreuve: 'Expression orale', texte: 'En tâche 2, variez les formes de questions : « Est-ce que… », inversion, mots interrogatifs.' },
  { epreuve: 'Expression orale', texte: 'Il est permis de demander à l\'examinateur de répéter : « Pourriez-vous reformuler, s\'il vous plaît ? ».' },
  { epreuve: 'Stratégie', texte: 'IRCC regarde chaque compétence séparément : entraînez-vous d\'abord sur la plus faible.' },
  { epreuve: 'Stratégie', texte: 'Écoutez 10 minutes de radio canadienne par jour pour vous habituer aux accents d\'ici.' }
];

// Astuce qui change chaque jour
export function astuceDuJour(date = new Date()) {
  const jour = Math.floor(date.getTime() / 86400000);
  return ASTUCES[jour % ASTUCES.length];
}
