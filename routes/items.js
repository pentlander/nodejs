const express = require('express');
const router = express.Router();
const { getPool, isDbReady } = require('../db');

// Bail early if Postgres isn't available
router.use((req, res, next) => {
  if (!isDbReady()) {
    return res.status(503).json({ error: 'Database not available' });
  }
  next();
});

// LIST — GET /api/items
router.get('/', async (req, res) => {
  try {
    const { rows } = await getPool().query(
      'SELECT * FROM items ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/items error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// READ — GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM items WHERE id = $1', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`GET /api/items/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// CREATE — POST /api/items
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const { rows } = await getPool().query(
      'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/items error:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// UPDATE — PUT /api/items/:id
router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const { rows } = await getPool().query(
      `UPDATE items SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [name, description || null, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`PUT /api/items/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE — DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await getPool().query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted', item: rows[0] });
  } catch (err) {
    console.error(`DELETE /api/items/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
