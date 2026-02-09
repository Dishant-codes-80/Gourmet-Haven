const mongoose = require('mongoose');

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/restaurant-dev';

const connectDB = async (mongoUri) => {
  const uri = mongoUri || process.env.MONGO_URI || DEFAULT_LOCAL_URI;
  try {
    await mongoose.connect(uri);
    if (uri.includes('mongodb.net')) {
      console.log('MongoDB Atlas connected successfully.');
    } else {
      console.log('Local MongoDB connected successfully.');
    }
    return;
  } catch (err) {
    console.error(`MongoDB connection error:`, err.message || err);
    // If the first attempt was to a remote Atlas URI, try falling back to local
    if (uri !== DEFAULT_LOCAL_URI) {
      try {
        console.log('Attempting fallback to local MongoDB...');
        await mongoose.connect(DEFAULT_LOCAL_URI);
        console.log(`MongoDB connected successfully to local fallback.`);
        return;
      } catch (localErr) {
        console.error('Local MongoDB fallback failed:', localErr.message || localErr);
      }
    }
    // As a last resort, rethrow so caller can decide what to do
    throw err;
  }
};

module.exports = connectDB;
