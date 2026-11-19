// Fonction Vercel : renvoie le code pays du visiteur (ex. « CM »), déterminé par Vercel à partir de l'adresse IP.
// Sert uniquement à afficher l'équivalent des prix en monnaie locale. Rien n'est enregistré.
module.exports = (req, res) => {
  const pays = req.headers['x-vercel-ip-country'] || null;
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ pays });
};
