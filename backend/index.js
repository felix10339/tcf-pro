const express = require('express');
const cors = require('cors');
require('dotenv').config();

const questionsRoute = require('./routes/questions');
const iaRoute = require('./routes/ia');
const authRoute = require('./routes/auth');
const paiementRoute = require('./routes/paiement');

const app = express();

// CORS — autoriser toutes les origines en production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Répondre aux preflight OPTIONS
app.options('*', cors());

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