const express = require('express');
const Reservation = require('../models/Reservation');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { sendReservationConfirmation } = require('../utils/emailService');

const router = express.Router();

// Public: create a reservation
router.post('/', async (req, res) => {
  const { name, email, phone, date, time, guests, table } = req.body;
  if (!name || !date || !time) return res.status(400).json({ message: 'Missing required fields' });
  try {
    const token = Math.random().toString(36).substr(2, 9).toUpperCase();
    const reservation = new Reservation({ name, email, phone, date, time, guests, table, token });
    await reservation.save();

    // Send confirmation email if email is provided
    if (email) {
      console.log('Drafting confirmation email for:', email);
      const emailResult = await sendReservationConfirmation({
        name,
        email,
        date,
        time,
        guests,
        table,
        token
      });

      if (emailResult.success) {
        console.log('✅ Confirmation email sent successfully to:', email);
      } else {
        console.error('❌ Failed to send confirmation email to:', email, 'Error:', emailResult.error);
        // Don't fail the reservation if email fails
      }
    } else {
      console.log('No email provided for reservation, skipping confirmation email.');
    }

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all reservations
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update status
router.put('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!reservation) return res.status(404).json({ message: 'Not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: delete reservation
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
