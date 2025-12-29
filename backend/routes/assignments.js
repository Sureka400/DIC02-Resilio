const express = require('express');
const Assignment = require('../models/Assignment');
const { authenticate, requireTeacher, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Get assignment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title subject')
      .populate('teacher', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has access to this assignment (teacher or enrolled student)
    const course = await require('../models/Course').findById(assignment.course);
    const isTeacher = assignment.teacher.toString() === req.user.id;
    const isEnrolled = course && course.students.includes(req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions for an assignment (teacher only)
router.get('/:id/submissions', authenticate, requireTeacher, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'name email')
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher of this assignment
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment.submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit an assignment (student only)
router.post('/:id/submit', authenticate, requireStudent, async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const studentId = req.user.id;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const course = await require('../models/Course').findById(assignment.course);
    if (!course || !course.students.includes(studentId)) {
      return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === studentId
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    assignment.submissions.push({
      student: studentId,
      content,
      attachments,
      submittedAt: new Date()
    });

    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment (teacher only)
router.put('/:id', authenticate, requireTeacher, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    const allowedUpdates = ['title', 'description', 'dueDate', 'totalPoints', 'instructions', 'attachments', 'status'];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        assignment[field] = updates[field];
      }
    });

    await assignment.save();

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assignment (teacher only)
router.delete('/:id', authenticate, requireTeacher, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await assignment.remove();

    // Remove from course assignments array
    await require('../models/Course').findByIdAndUpdate(
      assignment.course,
      { $pull: { assignments: assignment._id } }
    );

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;