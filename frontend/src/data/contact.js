// Coordonnées publiques de TCF Pro.
// Assemblées à l'exécution plutôt qu'écrites d'un bloc, pour compliquer un peu la tâche
// des robots qui récoltent les adresses dans le code des sites (protection partielle seulement).
const utilisateur = ['chatue', 'jorda'].join('');
const domaine = ['gmail', 'com'].join('.');
export const COURRIEL = `${utilisateur}@${domaine}`;

const indicatif = '237';
const numero = ['650', '014', '045'].join('');
export const WHATSAPP_AFFICHE = `+${indicatif} 6 50 01 40 45`;
export const WHATSAPP_LIEN = `https://wa.me/${indicatif}${numero}?text=${encodeURIComponent('Bonjour Felix, j\'ai une question sur TCF Pro.')}`;
// Réseaux sociaux : laisser null tant que le lien n'est pas connu (le lien n'est alors pas affiché)
export const TIKTOK_LIEN = null;

export const COURRIEL_LIEN =`mailto:${COURRIEL}?subject=${encodeURIComponent('Question sur TCF Pro')}`;
