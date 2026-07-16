import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Protect routes - requires valid JWT token
 */
export const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'healthvaultjwtsecretkeychangeinproduction99');
      
      // Get user from DB
      if (global.isMockDB) {
        // Fallback for demo mode
        req.user = global.mockUsers.find(u => u._id === decoded.id);
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'Not authorized, patient profile not found' });
        }
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
      }
      
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }
};

/**
 * Restrict routes to specific roles (RBAC)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : 'Guest'}) is not authorized to access this resource`
      });
    }
    next();
  };
};
