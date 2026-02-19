import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const secret = process.env.JWT_SECRET || 'default-secret';
const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
const refreshExpireDays = Number(process.env.REFRESH_EXPIRE_DAYS) || 7;
const refreshRememberDays = Number(process.env.REFRESH_REMEMBER_DAYS) || 30;

export function generateAccessToken(id, rememberMe = false) {
  return jwt.sign({ id, rememberMe }, secret, { expiresIn: accessExpire });
}

export function generateRefreshToken(id, rememberMe = false) {
  const days = rememberMe ? refreshRememberDays : refreshExpireDays;
  const expiresIn = `${days}d`;
  return jwt.sign({ id, rememberMe, type: 'refresh' }, secret, { expiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, secret);
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshExpiry(rememberMe = false) {
  const days = rememberMe ? refreshRememberDays : refreshExpireDays;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
