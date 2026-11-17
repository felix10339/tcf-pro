// Adresse du backend. Définie dans frontend/.env.production pour le site en ligne.
// (Nouveau nom de variable : l'ancienne REACT_APP_API_URL, restée dans les réglages Vercel,
// pointait vers un backend supprimé et prenait le dessus sur le dépôt.)
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
export default API_URL;
