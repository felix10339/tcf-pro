const jwt = require('jsonwebtoken');

// Aucune valeur par défaut : sans JWT_SECRET, n'importe qui pourrait forger un token.
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET manquant : définissez-le dans les variables d\'environnement.');
}

function verifierToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Token manquant' });
  try {
    req.utilisateur = jwt.verify(auth.replace('Bearer ', ''), SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
}

module.exports = { SECRET, verifierToken };
