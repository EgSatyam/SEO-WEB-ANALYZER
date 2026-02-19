import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = Number(process.env.RATE_LIMIT_MAX) || (isDev ? 500 : 100);

export const apiLimiter = rateLimit({
  windowMs,
  max,
  message: { message: 'Too many requests, please try again later.' },
  skip: (req) => req.method === 'POST' && req.path === '/auth/refresh',
});

const analyzeWindowMs = 60 * 1000;
const analyzeMax = Number(process.env.RATE_LIMIT_ANALYZE_MAX) || (isDev ? 60 : 15);

export const analyzeLimiter = rateLimit({
  windowMs: analyzeWindowMs,
  max: analyzeMax,
  message: { message: 'Too many analyses. Please try again in a minute.' },
});
