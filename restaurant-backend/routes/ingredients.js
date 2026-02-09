const express = require('express');
const Ingredient = require('../models/Ingredient');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all ingredients
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new ingredient
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, quantity, unit, category, threshold } = req.body;
  if (!name || !quantity || !unit) {
    return res.status(400).json({ message: 'Name, quantity, and unit are required' });
  }

  try {
    const newIngredient = new Ingredient({
      name,
      quantity,
      unit,
      category: category || 'General',
      threshold,
    });
    const saved = await newIngredient.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) { // Duplicate key
      return res.status(409).json({ message: 'Ingredient with this name already exists' });
    }
    console.error('Error saving new ingredient:', err); // Added detailed logging
    res.status(500).json({ message: 'Server error on save' });
  }
});

// Update ingredient
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, quantity, unit, category, threshold } = req.body;
  
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    ingredient.name = name || ingredient.name;
    ingredient.quantity = quantity !== undefined ? quantity : ingredient.quantity;
    ingredient.unit = unit || ingredient.unit;
    ingredient.category = category || ingredient.category;
    ingredient.threshold = threshold !== undefined ? threshold : ingredient.threshold;
    ingredient.lastUpdated = Date.now();

    const updated = await ingredient.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error on update' });
  }
});

// Delete ingredient
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    res.json({ message: 'Ingredient removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
