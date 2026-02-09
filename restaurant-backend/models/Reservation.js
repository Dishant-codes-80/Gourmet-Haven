const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, default: 1 },
  table: { type: String, default: 'TBD' },
  token: { type: String },
  hasOrdered: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
