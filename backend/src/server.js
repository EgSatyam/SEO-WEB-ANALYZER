import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

let dbConnected = false;

connectDB()
  .then(() => {
    dbConnected = true;
    logger.info('MongoDB connected');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err.message);
    logger.warn('Server starting without database connection - fix MongoDB Atlas IP whitelist');
  });

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running on ${HOST}:${PORT}`);
  logger.info(`Database connected: ${dbConnected}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  } else {
    logger.error('Server error:', err);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
