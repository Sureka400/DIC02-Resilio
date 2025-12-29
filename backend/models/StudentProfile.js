const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  engagementLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  consistencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  stressRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
