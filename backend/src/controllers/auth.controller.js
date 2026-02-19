import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  getRefreshExpiry,
} from '../utils/jwt.js';
import { refreshTokenCookieOptions } from '../config/cookies.js';
import asyncHandler from '../utils/asyncHandler.js';

function setRefreshCookie(res, token, rememberMe) {
  const maxAge = (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', token, {
    ...refreshTokenCookieOptions,
    maxAge,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', { path: '/' });
}

function userResponse(user) {
  if (!user) return null;
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    provider: user.provider,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }
  const user = await User.create({ email, password, name, provider: 'local' });
  const rememberMe = !!req.body.rememberMe;
  const accessToken = generateAccessToken(user._id, rememberMe);
  const refreshToken = generateRefreshToken(user._id, rememberMe);
  const tokenHash = hashRefreshToken(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: getRefreshExpiry(rememberMe),
    rememberMe,
  });
  setRefreshCookie(res, refreshToken, rememberMe);
  res.status(201).json({ user: userResponse(user), accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const rememberMe = !!req.body.rememberMe;
  const accessToken = generateAccessToken(user._id, rememberMe);
  const refreshToken = generateRefreshToken(user._id, rememberMe);
  const tokenHash = hashRefreshToken(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: getRefreshExpiry(rememberMe),
    rememberMe,
  });
  setRefreshCookie(res, refreshToken, rememberMe);
  res.json({ user: userResponse(user), accessToken });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }
  res.json({ user: userResponse(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    const err = new Error('No refresh token');
    err.statusCode = 401;
    throw err;
  }
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }
  const tokenHash = hashRefreshToken(token);
  const stored = await RefreshToken.findOne({
    userId: decoded.id,
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) {
    clearRefreshCookie(res);
    const err = new Error('Refresh token expired or revoked');
    err.statusCode = 401;
    throw err;
  }
  await RefreshToken.deleteOne({ _id: stored._id });
  const rememberMe = !!stored.rememberMe;
  const newRefreshToken = generateRefreshToken(decoded.id, rememberMe);
  const newHash = hashRefreshToken(newRefreshToken);
  await RefreshToken.create({
    userId: decoded.id,
    tokenHash: newHash,
    expiresAt: getRefreshExpiry(rememberMe),
    rememberMe,
  });
  setRefreshCookie(res, newRefreshToken, rememberMe);
  const accessToken = generateAccessToken(decoded.id, rememberMe);
  const user = await User.findById(decoded.id);
  if (!user) {
    clearRefreshCookie(res);
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }
  res.json({ user: userResponse(user), accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);
  res.json({ message: 'Logged out' });
});
