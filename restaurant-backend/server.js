require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const ingRoutes = require('./routes/ingredients');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const reservationsRoutes = require('./routes/reservations');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB(process.env.MONGO_URI).then(() => {
  // routes
  app.use('/api/auth', authRoutes);
  app.use('/api/ingredients', ingRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/reservations', reservationsRoutes);

  app.get('/', (req, res) => res.send('Restaurant backend is running'));

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
