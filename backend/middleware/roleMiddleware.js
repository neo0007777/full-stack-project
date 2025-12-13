// =======================
// ✅ ROLE-BASED MIDDLEWARE
// =======================

/**
 * Middleware to check if user has required role
 * @param {string[]} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions." 
      });
    }

    next();
  };
};

module.exports = roleMiddleware;

