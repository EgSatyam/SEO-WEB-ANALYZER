import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/seo-analyzer';
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}
