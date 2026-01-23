const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and extract user info
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .populate('hospitalId', 'name address')
      .select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Verify hospital admin role
const requireHospitalAdmin = (req, res, next) => {
  if (req.user.role !== 'hospital_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Hospital admin role required.'
    });
  }
  next();
};

// Verify user belongs to hospital (for hospital-scoped operations)
const requireHospitalAccess = (req, res, next) => {
  if (!req.user.hospitalId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. No hospital association found.'
    });
  }
  
  // Add hospitalId to request for easy access in routes
  req.hospitalId = req.user.hospitalId._id;
  next();
};

// Verify specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Hospital data isolation middleware - ensures all queries are scoped to user's hospital
const enforceHospitalScope = (req, res, next) => {
  // Add hospital filter to query parameters
  if (req.query) {
    req.query.hospitalId = req.hospitalId;
  }
  
  // Add hospital filter to request body for create/update operations
  if (req.body && typeof req.body === 'object') {
    req.body.hospitalId = req.hospitalId;
  }
  
  next();
};

module.exports = {
  authenticate,
  requireHospitalAdmin,
  requireHospitalAccess,
  requireRole,
  enforceHospitalScope
};