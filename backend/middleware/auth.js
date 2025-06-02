const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is verified
    const user = await User.findById(decoded.userId);
    if (!user || !user.isVerified) {
      throw new Error();
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists, is verified, and is admin
    const user = await User.findById(decoded.userId);
    if (!user || !user.isVerified || user.role !== 'admin') {
      throw new Error();
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Admin access required.' });
  }
};

module.exports = { auth, adminAuth }; 