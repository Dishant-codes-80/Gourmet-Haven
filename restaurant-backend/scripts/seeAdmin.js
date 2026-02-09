require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
      process.exit(1);
    }
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash: hash, role: 'admin' });
    await user.save();
    console.log('Admin created:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
