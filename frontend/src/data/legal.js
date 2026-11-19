// Pages légales de TCF Pro.
// ⚠️ Projets rédigés à partir du fonctionnement réel du site : à faire relire par un juriste
// avant d'en faire la seule base de la relation avec les clients.

export const MISE_A_JOUR = '19 novembre 2026';

export const DOCUMENTS_LEGAUX = {
  '/conditions': {
    titre: 'Conditions d\'utilisation',
    intro: 'Les présentes conditions encadrent l\'utilisation du site TCF Pro. En créant un compte ou en utilisant le site, vous les acceptez.',
    sections: [
      {
        titre: '1. Le service',
        texte: [
          'TCF Pro est une plateforme d\'entraînement au TCF Canada : questions de compréhension orale et écrite, sujets d\'expression écrite et orale, examens blancs, corrections par intelligence artificielle et guide de méthode.',
          'TCF Pro est une plateforme indépendante. Elle n\'est ni affiliée à France Éducation international, qui conçoit le TCF Canada, ni à Immigration, Réfugiés et Citoyenneté Canada (IRCC), ni approuvée par ces organismes.'
        ]
      },
      {
        titre: '2. Résultats estimés',
        texte: [
          'Les scores, niveaux et équivalences NCLC affichés sur TCF Pro sont des estimations pédagogiques. Ils ne constituent pas un résultat officiel et ne garantissent pas le résultat obtenu au TCF Canada.',
          'Les corrections sont produites par une intelligence artificielle. Elles peuvent comporter des erreurs et ne remplacent pas l\'évaluation d\'un examinateur certifié.'
        ]
      },
      {
        titre: '3. Votre compte',
        texte: [
          'Vous devez fournir une adresse courriel valide et garder votre mot de passe confidentiel. Vous êtes responsable de l\'utilisation de votre compte.',
          'Un compte est personnel : il ne peut pas être partagé ni revendu.'
        ]
      },
      {
        titre: '4. Abonnement Pro et paiement',
        texte: [
          'Certaines fonctionnalités sont réservées à l\'abonnement Pro (mensuel, trimestriel ou annuel). Les prix sont affichés en dollars canadiens, taxes applicables en sus le cas échéant.',
          'Le paiement est traité par Stripe. L\'abonnement se renouvelle automatiquement à la fin de chaque période jusqu\'à son annulation.',
          'Vous pouvez annuler à tout moment depuis votre profil (« Gérer mon abonnement »). L\'accès Pro reste actif jusqu\'à la fin de la période déjà payée. Les conditions de remboursement sont précisées dans la Politique de remboursement et d\'annulation.'
        ]
      },
      {
        titre: '5. Utilisation acceptable',
        texte: [
          'Il est interdit de copier, d\'extraire en masse ou de revendre le contenu du site, de contourner les limites d\'utilisation (notamment celles de la démonstration gratuite), ou d\'utiliser le site pour envoyer des contenus illicites, haineux ou sans rapport avec l\'apprentissage du français.',
          'En cas d\'abus, l\'accès au compte peut être suspendu.'
        ]
      },
      {
        titre: '6. Propriété intellectuelle',
        texte: [
          'Les questions, sujets, documents visuels, conseils, textes et éléments graphiques de TCF Pro sont protégés. Ils sont mis à votre disposition pour votre préparation personnelle uniquement.',
          'Vos productions (rédactions et transcriptions orales) vous appartiennent. Vous autorisez TCF Pro à les traiter pour vous fournir les corrections.'
        ]
      },
      {
        titre: '7. Responsabilité',
        texte: [
          'TCF Pro s\'efforce d\'assurer un service exact et disponible, sans pouvoir garantir l\'absence d\'erreurs ou d\'interruptions. TCF Pro ne peut être tenu responsable d\'une décision d\'immigration, d\'un résultat d\'examen ou d\'un choix pris sur la base des estimations du site.'
        ]
      },
      {
        titre: '8. Modifications',
        texte: [
          'Ces conditions peuvent évoluer. La date de mise à jour figure en haut de la page. En cas de changement important, les utilisateurs inscrits en seront informés.'
        ]
      }
    ]
  },

  '/confidentialite': {
    titre: 'Politique de confidentialité',
    intro: 'Cette politique explique quels renseignements personnels TCF Pro recueille, pourquoi, avec qui ils sont partagés et comment exercer vos droits, notamment en vertu de la Loi 25 du Québec et de la LPRPDE.',
    sections: [
      {
        titre: '1. Responsable',
        texte: [
          'Le responsable de la protection des renseignements personnels de TCF Pro est Felix Chatue, fondateur. Pour toute question ou demande : voir la section « Vous joindre » au bas de cette page.'
        ]
      },
      {
        titre: '2. Renseignements recueillis',
        liste: [
          'Compte : nom, adresse courriel et mot de passe. Le mot de passe est chiffré (bcrypt) : personne, y compris TCF Pro, ne peut le lire.',
          'Abonnement : forfait choisi, dates de la période en cours et identifiant client Stripe. Vos données de carte bancaire sont traitées uniquement par Stripe et ne sont jamais enregistrées par TCF Pro.',
          'Productions : les textes rédigés et les transcriptions orales que vous soumettez à la correction, avec la note et la correction obtenues.',
          'Démonstration gratuite : l\'adresse IP est utilisée temporairement (24 heures au maximum, en mémoire) pour limiter le nombre de corrections gratuites. Elle n\'est pas enregistrée dans une base de données.'
        ]
      },
      {
        titre: '3. Ce qui reste sur votre appareil',
        liste: [
          'Vos statistiques d\'entraînement et votre session de connexion sont conservées dans le stockage local de votre navigateur.',
          'Les enregistrements audio de l\'expression orale restent dans votre navigateur : seul le texte transcrit est envoyé pour la correction.',
          'La transcription automatique de la voix est assurée par le service de reconnaissance vocale de votre navigateur (par exemple celui de Google pour Chrome), selon les conditions de ce navigateur.',
          'TCF Pro n\'utilise pas de témoins (cookies) publicitaires ni d\'outils de pistage publicitaire.'
        ]
      },
      {
        titre: '4. Pourquoi nous les utilisons',
        liste: [
          'Créer et sécuriser votre compte.',
          'Fournir les exercices, les examens blancs et les corrections.',
          'Gérer votre abonnement et les paiements.',
          'Répondre à vos demandes et prévenir les abus.'
        ]
      },
      {
        titre: '5. Prestataires et transferts hors du Québec',
        texte: [
          'TCF Pro fait appel à des prestataires qui traitent certains renseignements pour son compte. Ils peuvent être situés hors du Québec et du Canada, notamment aux États-Unis :'
        ],
        liste: [
          'Supabase : hébergement de la base de données (comptes, abonnements, productions).',
          'Stripe : paiements et gestion des abonnements.',
          'Google (Gemini) : correction par intelligence artificielle des textes et transcriptions que vous soumettez.',
          'Railway et Vercel : hébergement du serveur et du site.'
        ],
        apres: 'Les renseignements ne sont ni vendus ni loués à des tiers.'
      },
      {
        titre: '6. Conservation',
        texte: [
          'Vos renseignements sont conservés tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et de vos productions à tout moment. Certaines informations de facturation peuvent être conservées par Stripe selon ses obligations légales.'
        ]
      },
      {
        titre: '7. Vos droits',
        texte: [
          'Vous pouvez demander l\'accès à vos renseignements, leur rectification, leur suppression, ou retirer votre consentement. Écrivez-nous en utilisant les coordonnées ci-dessous : nous répondons dans un délai de 30 jours.',
          'Si vous n\'êtes pas satisfait de notre réponse, vous pouvez vous adresser à la Commission d\'accès à l\'information du Québec ou au Commissariat à la protection de la vie privée du Canada.'
        ]
      },
      {
        titre: '8. Sécurité',
        texte: [
          'Les échanges avec le site sont chiffrés (HTTPS), les mots de passe sont chiffrés et l\'accès aux données est limité. Aucun système n\'étant infaillible, nous vous informerons de tout incident de confidentialité présentant un risque sérieux, comme la loi l\'exige.'
        ]
      }
    ]
  },

  '/remboursement': {
    titre: 'Remboursement et annulation',
    intro: 'Cette politique précise comment annuler votre abonnement Pro et dans quels cas un remboursement est possible.',
    sections: [
      {
        titre: '1. Annuler à tout moment',
        texte: [
          'Vous pouvez annuler votre abonnement à tout moment depuis votre profil, onglet « Abonnement », bouton « Gérer mon abonnement ». L\'annulation prend effet à la fin de la période en cours : vous gardez l\'accès Pro jusqu\'à cette date, et aucun nouveau prélèvement n\'est effectué.'
        ]
      },
      {
        titre: '2. Remboursements',
        texte: [
          'Les périodes déjà commencées ne sont pas remboursées au prorata.',
          'Un remboursement est accordé en cas d\'erreur de facturation, de double paiement, ou si un problème technique de notre part vous a empêché d\'utiliser les fonctionnalités Pro.',
          'Ces conditions s\'appliquent sans préjudice des droits que vous accorde la loi de votre lieu de résidence, notamment la Loi sur la protection du consommateur du Québec.'
        ]
      },
      {
        titre: '3. Faire une demande',
        texte: [
          'Écrivez-nous en précisant l\'adresse courriel de votre compte et la date du paiement concerné. Les remboursements accordés sont versés sur le moyen de paiement utilisé, via Stripe, généralement sous 5 à 10 jours ouvrables.'
        ]
      }
    ]
  }
};
