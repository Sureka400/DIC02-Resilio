const express = require('express');
const Course = require('../models/Course');
const Material = require('../models/Material');
const { authenticate, requireTeacher, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const { subject, grade, status = 'active' } = req.query;

    const filter = { status };
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;

    const courses = await Course.find(filter)
      .populate('teacher', 'name email')
      .select('title description subject grade teacher schedule status');

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID (public basic info)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .select('title description subject grade teacher schedule syllabus status');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll student in course (requires authentication)
router.post('/:id/enroll', authenticate, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id; // Get from authenticated user

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.students.push(studentId);
    await course.save();

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join course by class code (requires authentication)
router.post('/join', authenticate, requireStudent, async (req, res) => {
  try {
    const { classCode } = req.body;
    const studentId = req.user.id;

    if (!classCode) {
      return res.status(400).json({ message: 'Class code is required' });
    }

    const course = await Course.findOne({ classCode: classCode.toUpperCase() });
    if (!course) {
      return res.status(404).json({ message: 'Course with this code not found' });
    }

    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.students.push(studentId);
    await course.save();

    res.json({ message: 'Successfully joined course', courseId: course._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course assignments (requires enrollment)
router.get('/:id/assignments', authenticate, async (req, res) => {
  try {
    // Check if user is enrolled or is teacher
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'assignments',
        populate: {
          path: 'teacher',
          select: 'name email'
        }
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Allow if user is teacher of the course or enrolled student
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = course.students.includes(req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
    }

    let assignments = course.assignments;
    if (isEnrolled && !isTeacher) {
      assignments = course.assignments.map(assignment => {
        const submission = assignment.submissions.find(
          s => s.student.toString() === req.user.id
        );
        return {
          ...assignment.toObject(),
          submission: submission || null
        };
      });
    }

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course materials (requires enrollment)
router.get('/:id/materials', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Allow if user is teacher of the course or enrolled student
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = course.students.includes(req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
    }

    const materials = await Material.find({ course: req.params.id })
      .sort({ uploadedAt: -1 });

    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;