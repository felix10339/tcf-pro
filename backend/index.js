const express = require('express');
const cors = require('cors');
require('dotenv').config();

const questionsRoute = require('./routes/questions');
const iaRoute = require('./routes/ia');
const authRoute = require('./routes/auth');
const paiementRoute = require('./routes/paiement');

const app = express();

app.use(cors());

// Webhook Stripe doit être avant express.json()
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
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});