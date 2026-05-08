const express = require('express');
require('dotenv').config();

const questionsRoute = require('./routes/questions');
const iaRoute = require('./routes/ia');
const authRoute = require('./routes/auth');
const paiementRoute = require('./routes/paiement');

const app = express();

// CORS manuel — avant tout le reste
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Webhook Stripe avant express.json()
app.use('/api/paiement/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/questions', questionsRoute);
app.use('/api/ia', iaRoute);
app.use('/api/auth', authRoute);
app.use('/api/paiement', paiementRoute);

app.get('/', (req, res) => {
  res.json({ message: 'TCF Pro API — opérationnelle ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});