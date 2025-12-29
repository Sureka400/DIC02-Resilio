const express = require('express');
const { authenticate } = require('../middleware/auth');
const StudentBehavior = require('../models/StudentBehavior');
const StudentProfile = require('../models/StudentProfile');

const router = express.Router();

/**
 * Logic to compute psycho-educational levels based on behavior data
 * (NOT medical diagnosis)
 */
const computeProfile = (behavior) => {
  const {
    loginFrequency,
    assignmentSubmission,
    timeSpentOnMaterials,
    missedDeadlinesCount,
    timetableAdherence
  } = behavior;

  // Engagement Level Heuristics
  let engagementLevel = 'low';
  if (loginFrequency >= 5 && timeSpentOnMaterials >= 120) engagementLevel = 'high';
  else if (loginFrequency >= 3 || timeSpentOnMaterials >= 60) engagementLevel = 'medium';

  // Consistency Level Heuristics
  let consistencyLevel = 'low';
  if (assignmentSubmission === 'onTime' && missedDeadlinesCount === 0 && timetableAdherence >= 90) consistencyLevel = 'high';
  else if (assignmentSubmission !== 'missed' && missedDeadlinesCount <= 1 && timetableAdherence >= 70) consistencyLevel = 'medium';

  // Stress Risk Heuristics
  let stressRisk = 'low';
  if (missedDeadlinesCount >= 3 || timetableAdherence < 50 || loginFrequency < 2) stressRisk = 'high';
  else if (missedDeadlinesCount >= 1 || timetableAdherence < 70) stressRisk = 'medium';

  return { engagementLevel, consistencyLevel, stressRisk };
};

/**
 * @route POST /api/profile/generate
 * @desc Generate student psycho-educational profile
 * @access Private
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    // If student, use their ID; if teacher/admin, expect studentId in body
    const studentId = (req.user.role === 'student') ? req.user.id : req.body.studentId;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const behavior = await StudentBehavior.findOne({ studentId });
    if (!behavior) {
      return res.status(404).json({ message: 'No behavior data found for this student. Log behavior first.' });
    }

    const { engagementLevel, consistencyLevel, stressRisk } = computeProfile(behavior);

    let profile = await StudentProfile.findOne({ studentId });
    if (profile) {
      profile.engagementLevel = engagementLevel;
      profile.consistencyLevel = consistencyLevel;
      profile.stressRisk = stressRisk;
      profile.lastUpdated = Date.now();
      await profile.save();
    } else {
      profile = new StudentProfile({
        studentId,
        engagementLevel,
        consistencyLevel,
        stressRisk
      });
      await profile.save();
    }

    res.json({ message: 'Profile generated successfully', profile });
  } catch (error) {
    console.error('Error generating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/profile/:studentId
 * @desc Get student profile (Engagement & Risk levels)
 * @access Private
 */
router.get('/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Privacy check: Teachers can see this (requirement 6), 
    // but only the high-level engagement/risk fields which are all that's in this model.
    const profile = await StudentProfile.findOne({ studentId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
