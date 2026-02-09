require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const dummyOrders = [
      {
        customer: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        items: 'Paneer Tikka, Butter Chicken',
        table: 5,
        total: 900,
        status: 'Pending',
        paymentStatus: 'Pending',
        paymentMethod: 'Cash',
        notes: 'Extra spicy'
      },
      {
        customer: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        items: 'Chicken Biryani, Mango Lassi',
        table: 3,
        total: 660,
        status: 'Preparing',
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        notes: ''
      },
      {
        customer: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '1122334455',
        items: 'Dal Makhani, Gulab Jamun',
        table: 7,
        total: 600,
        status: 'Ready',
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
        notes: 'Vegetarian'
      },
      {
        customer: 'Bob Brown',
        email: 'bob@example.com',
        phone: '5566778899',
        items: 'Chole Bhature, Fresh Lime Soda',
        table: 2,
        total: 510,
        status: 'Completed',
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        notes: ''
      }
    ];

    for (const orderData of dummyOrders) {
      const existing = await Order.findOne({ customer: orderData.customer, items: orderData.items });
      if (!existing) {
        const order = new Order(orderData);
        await order.save();
        console.log('Order created for:', orderData.customer);
      } else {
        console.log('Order already exists for:', orderData.customer);
      }
    }

    console.log('Dummy orders seeded');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding orders:', err);
    process.exit(1);
  }
};

run();