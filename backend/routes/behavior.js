const express = require('express');
const { authenticate, requireStudent } = require('../middleware/auth');
const StudentBehavior = require('../models/StudentBehavior');

const router = express.Router();

/**
 * @route GET /api/behavior
 * @desc Get student behavior data
 * @access Private (Student only)
 */
router.get('/', [authenticate, requireStudent], async (req, res) => {
  try {
    const behavior = await StudentBehavior.findOne({ studentId: req.user.id });
    if (!behavior) {
      return res.status(404).json({ message: 'Behavior data not found' });
    }
    res.json(behavior);
  } catch (error) {
    console.error('Error fetching behavior:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/behavior/log
 * @desc Log student behavior data
 * @access Private (Student only)
 */
router.post('/log', [authenticate, requireStudent], async (req, res) => {
  try {
    const {
      loginFrequency,
      assignmentSubmission,
      timeSpentOnMaterials,
      missedDeadlinesCount,
      aiChatUsageCount,
      timetableAdherence
    } = req.body;

    const studentId = req.user.id;

    let behavior = await StudentBehavior.findOne({ studentId });

    if (behavior) {
      // Update existing record
      if (loginFrequency !== undefined) behavior.loginFrequency = loginFrequency;
      if (assignmentSubmission !== undefined) behavior.assignmentSubmission = assignmentSubmission;
      if (timeSpentOnMaterials !== undefined) behavior.timeSpentOnMaterials = timeSpentOnMaterials;
      if (missedDeadlinesCount !== undefined) behavior.missedDeadlinesCount = missedDeadlinesCount;
      if (aiChatUsageCount !== undefined) behavior.aiChatUsageCount = aiChatUsageCount;
      if (timetableAdherence !== undefined) behavior.timetableAdherence = timetableAdherence;
      behavior.lastUpdated = Date.now();
      await behavior.save();
    } else {
      // Create new record
      behavior = new StudentBehavior({
        studentId,
        loginFrequency,
        assignmentSubmission,
        timeSpentOnMaterials,
        missedDeadlinesCount,
        aiChatUsageCount,
        timetableAdherence
      });
      await behavior.save();
    }

    res.json({ message: 'Behavior data logged successfully', behavior });
  } catch (error) {
    console.error('Error logging behavior:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
