const express = require('express');
const Ingredient = require('../models/Ingredient');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public => list ingredients
router.get('/', async (req, res) => {
  try {
    const items = await Ingredient.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    console.error('GET /api/ingredients error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin => add ingredient
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, quantity, unit, threshold } = req.body;
    const ingredient = new Ingredient({ name, quantity, unit, lastUpdated: new Date(), threshold });
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (err) {
    console.error('POST /api/ingredients error', err);
    if (err.code === 11000) return res.status(409).json({ message: 'Ingredient already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin => update quantity / lastUpdated
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { quantity, unit, name } = req.body;
    const ing = await Ingredient.findById(req.params.id);
    if (!ing) return res.status(404).json({ message: 'Not found' });
    if (typeof name !== 'undefined') ing.name = name;
    if (typeof quantity !== 'undefined') ing.quantity = quantity;
    if (typeof unit !== 'undefined') ing.unit = unit;
    ing.lastUpdated = new Date();
    await ing.save();
    res.json(ing);
  } catch (err) {
    console.error('PUT /api/ingredients error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin => delete
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/ingredients error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
