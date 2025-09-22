// server/middleware/auth.js

const prisma       = require('../prisma/client');
const jwt          = require('jsonwebtoken');

/**
 * 1) Authenticate middleware reads & verifies JWT, then attaches `req.user = { id, role, isSuperAdmin? }`
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // include id, role, and possibly isSuperAdmin if you encoded it
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

/**
 * 2) authorizeRole is now a factory that returns middleware.
 *    It re-reads the current user’s role from the DB.
 */
function authorizeRole(requiredRole) {
  return async (req, res, next) => {
    // Ensure authenticate() ran first
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Fetch the real record
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, isSuperAdmin: true }
    });

    if (!me) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Super-admin always allowed
    if (me.isSuperAdmin) {
      return next();
    }

    // Otherwise require exact role match
    if (me.role !== requiredRole) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeRole
};
