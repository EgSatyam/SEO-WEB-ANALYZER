import { verifyAccessToken } from '../utils/jwt.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  req.user = { id: decoded.id };
  next();
});
