const mongoose = require('mongoose');

const studentBehaviorSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  loginFrequency: {
    type: Number,
    default: 0
  },
  assignmentSubmission: {
    type: String,
    enum: ['onTime', 'late', 'missed'],
    default: 'onTime'
  },
  timeSpentOnMaterials: {
    type: Number, // in minutes
    default: 0
  },
  missedDeadlinesCount: {
    type: Number,
    default: 0
  },
  aiChatUsageCount: {
    type: Number,
    default: 0
  },
  timetableAdherence: {
    type: Number, // percentage
    default: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentBehavior', studentBehaviorSchema);
