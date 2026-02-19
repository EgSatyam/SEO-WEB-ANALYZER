const isProduction = process.env.NODE_ENV === 'production';
const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'strict' : 'lax');
const secure = process.env.COOKIE_SECURE === 'true' || isProduction;

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/',
};
