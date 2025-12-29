const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resolio')
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.log('❌ MongoDB connection error:', err.message);
  console.log('Please make sure MongoDB is running or update MONGODB_URI in .env file');
  console.log('For cloud MongoDB, use: mongodb+srv://username:password@cluster.mongodb.net/resolio');
  // Don't exit, continue without DB for development
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection:', err.message);
  // Don't exit, just log
});
// Routes
console.log('Loading routes...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth route loaded');
} catch (error) {
  console.error('❌ Error loading auth route:', error.message);
}
try {
  app.use('/api/chat', require('./routes/chat'));
  console.log('✅ Chat route loaded');
} catch (error) {
  console.error('❌ Error loading chat route:', error.message);
}
  app.use('/api/students', require('./routes/students'));
  app.use('/api/teachers', require('./routes/teachers'));
  app.use('/api/courses', require('./routes/courses'));
  app.use('/api/assignments', require('./routes/assignments'));
  app.use('/api/behavior', require('./routes/behavior'));
  app.use('/api/profile', require('./routes/profile'));
  app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'OK',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint (no database required)
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Resolio Backend API is working!',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      teachers: '/api/teachers',
      courses: '/api/courses',
      assignments: '/api/assignments',
      behavior: '/api/behavior',
      profile: '/api/profile',
      ai: '/api/ai'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
console.log(`Attempting to start server on port ${PORT}...`);
app.listen(PORT, () => {
  console.log(`✅ Server successfully listening on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

module.exports = app;