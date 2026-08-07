const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Express middleware to authenticate JWT access tokens in incoming request authorization headers.
 * Extracts Bearer token, verifies JWT signature, fetches user entity based on role ID, and attaches `req.user`.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization header missing or invalid');
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized: Token invalid or expired' });
    }

    if (!decoded.id) {
      return res.status(401).json({ message: 'Unauthorized: Token missing user id' });
    }

    // Fetch user from unified User table, fallback to role-specific tables if necessary
    const userId = Number(decoded.id);
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    // Backward compatibility fallback for legacy table user IDs if User record not yet migrated
    if (!user) {
      const roleId = Number(decoded.roleId);
      if (roleId === 1) user = await prisma.admin.findUnique({ where: { id: userId } });
      else if (roleId === 2) user = await prisma.doctor.findUnique({ where: { id: userId } });
      else if (roleId === 3) user = await prisma.dSAProfile.findUnique({ where: { id: userId } });
      else if (roleId === 4) user = await prisma.receptionist.findUnique({ where: { id: userId } });
      else if (roleId === 5) user = await prisma.hRProfile.findUnique({ where: { id: userId } });
    }

    if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({ message: 'Unauthorized: Middleware failure' });
  }
};
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.roleId)) {
    return res.status(403).json({ message: 'Forbidden: Access denied' });
  }
  next();
};

authMiddleware.authorize = authorize;
module.exports = authMiddleware;
