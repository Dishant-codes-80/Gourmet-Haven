const express = require('express');
const MenuItem = require('../models/MenuItem');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().populate('ingredients');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new menu item (with optional image upload)
router.post('/', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  const { name, description, price, category, available, ingredients } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }

  try {
    const newItem = new MenuItem({
      name,
      description,
      price,
      category,
      available,
      ingredients,
      image: req.file ? req.file.filename : null, // Store filename if image uploaded
    });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server error on save' });
  }
});

// Update menu item
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, description, price, category, available, ingredients } = req.body;

  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price || item.price;
    item.category = category || item.category;
    item.available = available !== undefined ? available : item.available;
    item.ingredients = ingredients || item.ingredients;
    item.lastUpdated = Date.now();

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error on update' });
  }
});

// Delete menu item
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
