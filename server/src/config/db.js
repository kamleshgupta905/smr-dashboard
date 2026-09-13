const mongoose = require('mongoose');

// Disable buffering so calls fail fast when DB is disconnected instead of hanging 10s
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smr';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`! MongoDB Connection Warning: ${error.message}`);
    console.warn('! The server will continue running and serve live Zamplia APIs directly.');
  }
};

module.exports = connectDB;
