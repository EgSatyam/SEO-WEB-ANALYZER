import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import 'dotenv/config';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/seo-analyzer';
  
  const options = {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4 for compatibility
    retryWrites: true,
    w: 'majority',
  };

  try {
    await mongoose.connect(uri, options);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

