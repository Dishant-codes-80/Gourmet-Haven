const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  email: { type: String },
  phone: { type: String }, // General phone (optional)
  customerPhone: { type: String }, // Online specific phone
  deliveryAddress: { type: String }, // Online specific
  instructions: { type: String }, // Delivery instructions
  orderType: { type: String, enum: ['Advance', 'Online'], default: 'Advance' },
  items: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String }, // Cache name for PDF
    price: { type: Number }, // Cache price for PDF
    quantity: { type: Number, required: true }
  }],
  table: { type: String },
  token: { type: String },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Stripe', 'Razorpay', 'POD', 'Razorpay (Mock)', 'Stripe (Mock)'], default: 'Cash' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
