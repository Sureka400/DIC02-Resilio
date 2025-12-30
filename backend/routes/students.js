const express = require('express');
const { authenticate, requireStudent } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', [authenticate, requireStudent], async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's enrolled courses
    const courses = await Course.find({
      students: studentId,
      status: 'active'
    }).populate('teacher', 'name email');

    // Get upcoming assignments
    const upcomingAssignments = await Assignment.find({
      course: { $in: courses.map(c => c._id) },
      dueDate: { $gte: new Date() },
      status: 'published'
    })
    .populate('course', 'title subject')
    .sort({ dueDate: 1 })
    .limit(5);

    // Get recent grades
    const recentSubmissions = await Assignment.find({
      'submissions.student': studentId
    })
    .populate('course', 'title')
    .select('title course submissions')
    .sort({ 'submissions.submittedAt': -1 })
    .limit(10);

    const grades = recentSubmissions.map(assignment => {
      const submission = assignment.submissions.find(s => s.student.toString() === studentId);
      return {
        assignment: assignment.title,
        course: assignment.course.title,
        grade: submission?.grade,
        submittedAt: submission?.submittedAt
      };
    }).filter(item => item.grade !== undefined);

    // Get current student profile
    const user = await User.findById(studentId);

    res.json({
      courses: courses.length,
      upcomingAssignments,
      recentGrades: grades.slice(0, 5),
      profile: {
        name: user.name,
        grade: user.academicInfo?.grade || 'N/A',
        gpa: grades.length > 0 ? (grades.reduce((sum, g) => sum + (g.grade / 100) * 4, 0) / grades.length).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's courses
router.get('/courses', [authenticate, requireStudent], async (req, res) => {
  try {
    const courses = await Course.find({
      students: req.user.id,
      status: 'active'
    })
    .populate('teacher', 'name email')
    .select('title description subject grade schedule');

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course details
router.get('/courses/:courseId', [authenticate, requireStudent], async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      students: req.user.id
    })
    .populate('teacher', 'name email')
    .populate('assignments');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's assignments
router.get('/assignments', [authenticate, requireStudent], async (req, res) => {
  try {
    const assignments = await Assignment.find({
      course: {
        $in: await Course.find({ students: req.user.id }).distinct('_id')
      }
    })
    .populate('course', 'title subject')
    .select('title description dueDate totalPoints type status submissions');

    // Filter submissions for current student
    const assignmentsWithSubmissions = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        s => s.student.toString() === req.user.id
      );
      return {
        ...assignment.toObject(),
        submission: submission || null
      };
    });

    res.json(assignmentsWithSubmissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assignment
router.post('/assignments/:assignmentId/submit', [authenticate, requireStudent], async (req, res) => {
  try {
    const { content, attachments } = req.body;

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findOne({
      _id: assignment.course,
      students: req.user.id
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized to submit this assignment' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === req.user.id
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Add submission
    assignment.submissions.push({
      student: req.user.id,
      content,
      attachments: attachments || [],
      submittedAt: new Date()
    });

    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's grades
router.get('/grades', [authenticate, requireStudent], async (req, res) => {
  try {
    const assignments = await Assignment.find({
      'submissions.student': req.user.id
    })
    .populate('course', 'title subject')
    .select('title course submissions totalPoints');

    const grades = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        s => s.student.toString() === req.user.id
      );
      return {
        assignment: assignment.title,
        course: assignment.course.title,
        grade: submission?.grade,
        totalPoints: assignment.totalPoints,
        percentage: submission?.grade ? (submission.grade / assignment.totalPoints) * 100 : null,
        feedback: submission?.feedback,
        submittedAt: submission?.submittedAt,
        gradedAt: submission?.gradedAt
      };
    });

    // Calculate GPA
    const gradedAssignments = grades.filter(g => g.grade !== undefined);
    const gpa = gradedAssignments.length > 0
      ? gradedAssignments.reduce((sum, g) => sum + (g.percentage / 100) * 4, 0) / gradedAssignments.length
      : 0;

    res.json({
      grades,
      summary: {
        totalAssignments: assignments.length,
        gradedAssignments: gradedAssignments.length,
        averageGrade: gradedAssignments.length > 0
          ? gradedAssignments.reduce((sum, g) => sum + g.percentage, 0) / gradedAssignments.length
          : 0,
        gpa: Math.round(gpa * 100) / 100
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile
router.put('/profile', [authenticate, requireStudent], async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'profile'];

    const updateData = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;