import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'petals_enterprise_saas_super_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'petals_refresh_super_secret_key_2026';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
