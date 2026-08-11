import { verifyAccessToken } from '../config/jwt.js';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired access token' });
  }

  req.user = decoded;
  next();
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    // Admin has full access to everything
    if (req.user.role === 'Admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
