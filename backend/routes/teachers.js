const express = require('express');
const { authenticate, requireTeacher } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Material = require('../models/Material');

const router = express.Router();

// Get teacher dashboard data
router.get('/dashboard', [authenticate, requireTeacher], async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher's courses
    const courses = await Course.find({ teacher: teacherId });

    // Get total students
    const totalStudents = await Course.distinct('students', { teacher: teacherId });
    const uniqueStudents = [...new Set(totalStudents.flat())];

    // Get pending assignments to grade
    const pendingAssignments = await Assignment.find({
      teacher: teacherId,
      'submissions.grade': { $exists: false }
    }).populate('course', 'title');

    res.json({
      coursesCount: courses.length,
      studentsCount: uniqueStudents.length,
      pendingAssignmentsCount: pendingAssignments.length,
      recentActivity: [] // TODO: Implement activity log
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's courses
router.get('/courses', [authenticate, requireTeacher], async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id })
      .populate('students', 'name email')
      .select('title description subject grade students schedule status');

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new course
router.post('/courses', [authenticate, requireTeacher], async (req, res) => {
  try {
    console.log('Creating course with body:', req.body);
    console.log('Teacher ID:', req.user.id);
    
    let classCode = req.body.classCode?.toUpperCase();
    
    if (classCode) {
      const existingCourse = await Course.findOne({ classCode });
      if (existingCourse) {
        return res.status(400).json({ message: 'Class code already in use. Please choose a different code.' });
      }
    } else {
      classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    const course = new Course({
      ...req.body,
      teacher: req.user.id,
      classCode
    });

    await course.save();
    console.log('Course created successfully:', course._id);
    res.status(201).json(course);
  } catch (error) {
    console.error('Error in create course route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get course details with students and assignments
router.get('/courses/:courseId', [authenticate, requireTeacher], async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user.id
    })
    .populate('students', 'name email profile')
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

// Create assignment for a course
router.post('/courses/:courseId/assignments', [authenticate, requireTeacher], async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user.id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const assignment = new Assignment({
      ...req.body,
      course: req.params.courseId,
      teacher: req.user.id
    });

    await assignment.save();

    // Add assignment to course
    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignments for teacher's courses
router.get('/assignments', [authenticate, requireTeacher], async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user.id })
      .populate('course', 'title subject')
      .populate('submissions.student', 'name email');

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grade assignment submission
router.put('/assignments/:assignmentId/submissions/:submissionId/grade', [authenticate, requireTeacher], async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      teacher: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await assignment.save();

    res.json({ message: 'Grade submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students in teacher's courses
router.get('/students', [authenticate, requireTeacher], async (req, res) => {
  try {
    const students = await User.find({
      _id: {
        $in: await Course.distinct('students', { teacher: req.user.id })
      }
    }).select('name email profile academicInfo status');

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher profile
router.get('/profile', [authenticate, requireTeacher], async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      profile: teacher.profile,
      academicInfo: teacher.academicInfo,
      status: teacher.status,
      createdAt: teacher.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update teacher profile
router.put('/profile', [authenticate, requireTeacher], async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'profile', 'academicInfo'];

    const updateData = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const teacher = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        profile: teacher.profile,
        academicInfo: teacher.academicInfo,
        status: teacher.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload material to course
router.post('/courses/:courseId/materials', [authenticate, requireTeacher], async (req, res) => {
  const upload = req.app.locals.upload;
  
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }

    try {
      const { title, description, url } = req.body;
      
      if (!req.file && !url) {
        return res.status(400).json({ message: 'No file or URL provided' });
      }
      
      const course = await Course.findOne({
        _id: req.params.courseId,
        teacher: req.user.id
      });

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      let materialData = {
        title,
        description,
        course: req.params.courseId,
        teacher: req.user.id,
      };

      if (req.file) {
        materialData.fileUrl = `/uploads/${req.file.filename}`;
        materialData.fileName = req.file.originalname;
        materialData.fileType = req.file.mimetype;
        materialData.fileSize = req.file.size;
        materialData.type = 'file';
      } else {
        materialData.fileUrl = url;
        materialData.fileName = title; // Use title as filename for URLs
        materialData.type = 'url';
      }

      const material = new Material(materialData);

      await material.save();
      res.status(201).json(material);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

// Get materials for a course
router.get('/courses/:courseId/materials', [authenticate, requireTeacher], async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user.id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const materials = await Material.find({ course: req.params.courseId })
      .sort({ uploadedAt: -1 });

    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete material
router.delete('/materials/:materialId', [authenticate, requireTeacher], async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.materialId,
      teacher: req.user.id
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    await Material.findByIdAndDelete(req.params.materialId);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/courses/:courseId', [authenticate, requireTeacher], async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user.id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.students.length > 0) {
      return res.status(400).json({ message: 'Cannot delete a course with enrolled students' });
    }

    await Course.findByIdAndDelete(req.params.courseId);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;