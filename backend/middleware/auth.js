const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth failed: No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('Auth failed: User not found for ID', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    };

    console.log(`Auth success: User ${user.email} with role ${user.role}`);
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is a student
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    console.log(`Access denied: Role ${req.user.role} is not student`);
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  next();
};

// Middleware to check if user is a teacher
const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    console.log(`Access denied: Role ${req.user.role} is not teacher`);
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  next();
};

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = {
  authenticate,
  requireStudent,
  requireTeacher,
  requireAdmin
};