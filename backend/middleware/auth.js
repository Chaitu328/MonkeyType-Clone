const jwt = require('jsonwebtoken');
const User = require('../models/User');

// console.log('=== DEBUGGING AUTH MIDDLEWARE ===');

const authMiddleware = async (req, res, next) => {
  // console.log('Auth middleware executing');
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authentication required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) throw new Error('User not found');
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// console.log('Type of authMiddleware:', typeof authMiddleware);
module.exports = authMiddleware;