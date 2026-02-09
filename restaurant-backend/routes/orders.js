const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Ingredient = require('../models/Ingredient');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { generateBillPDF } = require('../utils/pdfService');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = express.Router();

// Get all orders (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate and download bill PDF for an order
router.get('/:id/bill', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items._id');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Generate PDF
    const pdfDoc = generateBillPDF(order);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${order._id}.pdf`);

    // Pipe the PDF to the response
    pdfDoc.pipe(res);
  } catch (err) {
    console.error('Error generating bill PDF:', err);
    res.status(500).json({ message: 'Failed to generate bill PDF' });
  }
});

// Create a Razorpay Order
router.post('/create-razorpay-order', async (req, res) => {
  const { amount } = req.body;

  // Development / Mock Mode toggle
  const isPlaceholder = process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder' || !process.env.RAZORPAY_KEY_ID;

  if (isPlaceholder || !amount || isNaN(amount)) {
    console.log('--- Razorpay Mock Mode Active (or invalid amount) ---');
    return res.json({
      id: `order_${Date.now()}`,
      amount: Math.round((amount || 0) * 100),
      currency: 'INR',
      mock: true
    });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Razorpay Order Error Details:', {
      message: err.message,
      code: err.code,
      description: err.description
    });
    res.status(500).json({
      message: 'Failed to create payment order',
      error: err.message
    });
  }
});

// Verify Razorpay Payment
router.post('/verify-razorpay-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const crypto = require('crypto');

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ status: 'success' });
    } else {
      res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Verification Error:', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Create order (customer or admin)
router.post('/', async (req, res) => {
  const {
    customer,
    email,
    phone,
    customerPhone,
    deliveryAddress,
    instructions,
    orderType,
    items,
    table,
    total,
    token,
    notes,
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId
  } = req.body;

  if (token) {
    // Single-use token logic (Advance Order)
    try {
      const reservation = await require('../models/Reservation').findOne({ token, table });
      if (!reservation) {
        return res.status(400).json({ message: 'Invalid token or table number' });
      }
      if (reservation.hasOrdered) {
        return res.status(400).json({ message: 'This token has already been used for an order' });
      }

      // Mark reservation as ordered
      reservation.hasOrdered = true;
      await reservation.save();
    } catch (err) {
      console.error('Token validation error:', err);
      return res.status(500).json({ message: 'Internal server error checking token' });
    }
  } else if (orderType === 'Online') {
    if (!customer || !customerPhone || !deliveryAddress || !items || !total) {
      return res.status(400).json({ message: 'Missing required delivery fields' });
    }
  } else if (!customer || !items || !total) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const order = new Order({
      customer,
      email,
      phone,
      customerPhone,
      deliveryAddress,
      instructions,
      orderType: orderType || 'Advance',
      items,
      table,
      total,
      token,
      notes,
      paymentStatus: (orderType === 'Online' && (paymentMethod === 'Razorpay' || paymentMethod === 'Card')) ? 'Paid' : 'Pending',
      paymentMethod: paymentMethod || (orderType === 'Online' ? 'Razorpay' : 'Cash'),
      razorpayOrderId,
      razorpayPaymentId
    });
    await order.save();

    // Send confirmation email
    if (email) {
      try {
        await sendOrderConfirmationEmail(order, email);
      } catch (emailErr) {
        console.error('Non-critical: Failed to send confirmation email:', emailErr);
      }
    }
    // Adjust inventory based on items sold
    for (const item of items) {
      const menuItem = await MenuItem.findById(item._id).populate('ingredients');
      if (menuItem) {
        for (const ingredient of menuItem.ingredients) {
          ingredient.quantity -= 1; // Assuming 1 unit of each ingredient per menu item
          await ingredient.save();
        }
      }
    }
    res.status(201).json(order);
  } catch (err) {
    console.error('Order Creation Error:', err);
    res.status(500).json({
      message: 'Failed to save order',
      error: err.message,
      details: err.errors ? Object.keys(err.errors).map(k => err.errors[k].message) : []
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Status required' });

  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update payment (admin only)
router.put('/:id/payment', authMiddleware, adminOnly, async (req, res) => {
  const { paymentStatus, paymentMethod } = req.body;

  try {
    const update = {};
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (paymentMethod) update.paymentMethod = paymentMethod;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update notes (admin only)
router.put('/:id/notes', authMiddleware, adminOnly, async (req, res) => {
  const { notes } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { notes }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete order (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
