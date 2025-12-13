const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 * 
 * Note: User model must be registered with mongoose before this middleware is used
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log('❌ No token in authorization header');
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Access User model (must be registered in server.js first)
    const User = mongoose.model('User');
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user with role from both token and database
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || decoded.role
    };
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;

