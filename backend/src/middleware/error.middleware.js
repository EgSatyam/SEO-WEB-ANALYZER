import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join('; ') || message;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    status = 400;
    message = 'Email already registered';
  }

  if (status >= 500) {
    logger.error('Server error:', err);
  }

  res.status(status).json({ message });
}
