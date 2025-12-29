const express = require('express');
const Assignment = require('../models/Assignment');

const { authenticate, requireTeacher } = require('../middleware/auth');
const Course = require('../models/Course');

const router = express.Router();

// Get assignment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title subject students teacher')
      .populate('teacher', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has access (is student in course or is teacher of course)
    const isStudent = assignment.course.students.includes(req.user.id);
    const isTeacher = assignment.teacher._id.toString() === req.user.id;

    if (!isStudent && !isTeacher) {
      return res.status(403).json({ message: 'Not authorized to view this assignment' });
    }

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions for an assignment (teacher only)
router.get('/:id/submissions', [authenticate, requireTeacher], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'name email')
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher of this assignment
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view submissions' });
    }

    res.json(assignment.submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment (teacher only)
router.put('/:id', [authenticate, requireTeacher], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
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
router.delete('/:id', [authenticate, requireTeacher], async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await assignment.deleteOne(); // assignment.remove() is deprecated in newer mongoose

    // Remove from course assignments array
    await Course.findByIdAndUpdate(
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