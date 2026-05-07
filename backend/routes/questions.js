const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('id');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

router.get('/section/:section', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('section', req.params.section)
    .order('id');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ message: 'Question non trouvée' });
  res.json(data);
});

module.exports = router;