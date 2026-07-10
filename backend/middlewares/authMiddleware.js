const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

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

    // Check user exists
    
    const user = await prisma.admin.findUnique({ where: { id: Number(decoded.id) } });
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
module.exports = authMiddleware, authorize;
