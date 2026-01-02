const express = require('express');
const { authenticate, requireTeacher } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Material = require('../models/Material');
const StudentBehavior = require('../models/StudentBehavior');
const StudentProfile = require('../models/StudentProfile');

const router = express.Router();

// Get teacher dashboard data
router.get('/dashboard', [authenticate, requireTeacher], async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher's courses
    const courses = await Course.find({ teacher: teacherId });
    const courseIds = courses.map(c => c._id);

    // Get total students
    const totalStudentsIds = await Course.distinct('students', { teacher: teacherId });
    const uniqueStudents = [...new Set(totalStudentsIds.flat())];

    // Get all assignments for these courses
    const assignments = await Assignment.find({ course: { $in: courseIds } });

    // Get pending assignments to grade
    const pendingToGrade = assignments.filter(a => 
      a.submissions.some(s => s.grade === undefined)
    );

    // Calculate Submission Trends (Mocking weeks for now based on actual data if possible)
    const submissionTrends = [
      { week: 'Week 1', submissions: 0, onTime: 0 },
      { week: 'Week 2', submissions: 0, onTime: 0 },
      { week: 'Week 3', submissions: 0, onTime: 0 },
      { week: 'Week 4', submissions: 0, onTime: 0 },
    ];

    // Fill with real data if available
    assignments.forEach(a => {
      a.submissions.forEach(s => {
        const week = Math.ceil((new Date() - s.submittedAt) / (7 * 24 * 60 * 60 * 1000));
        if (week >= 1 && week <= 4) {
          const index = 4 - week;
          submissionTrends[index].submissions++;
          if (s.submittedAt <= a.dueDate) {
            submissionTrends[index].onTime++;
          }
        }
      });
    });

    // Calculate Participation Data
    const participationData = await Promise.all(courses.map(async (course) => {
      const studentIds = course.students;
      const profiles = await StudentProfile.find({ studentId: { $in: studentIds } });
      
      return {
        class: course.title,
        active: profiles.filter(p => p.engagementLevel === 'high').length,
        moderate: profiles.filter(p => p.engagementLevel === 'medium').length,
        low: profiles.filter(p => p.engagementLevel === 'low').length,
      };
    }));

    // Calculate Assignment Status Data
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    assignments.forEach(a => {
      const totalStudentsInCourse = courses.find(c => c._id.toString() === a.course.toString())?.students.length || 0;
      const submittedCount = a.submissions.length;
      completed += submittedCount;
      notStarted += (totalStudentsInCourse - submittedCount);
    });

    const assignmentStatusData = [
      { name: 'Completed', value: completed, color: '#FFD600' },
      { name: 'In Progress', value: inProgress, color: '#FFB800' },
      { name: 'Not Started', value: notStarted, color: '#a8a6a1' },
    ];

    // Engagement Heatmap Data (Mocking days)
    const engagementHeatmapData = [
      { day: 'Mon', engagement: 0 },
      { day: 'Tue', engagement: 0 },
      { day: 'Wed', engagement: 0 },
      { day: 'Thu', engagement: 0 },
      { day: 'Fri', engagement: 0 },
    ];

    const behaviors = await StudentBehavior.find({ studentId: { $in: uniqueStudents } });
    // This is a simplification
    engagementHeatmapData.forEach((item, idx) => {
      const avgAdherence = behaviors.length > 0 
        ? behaviors.reduce((sum, b) => sum + b.timetableAdherence, 0) / behaviors.length 
        : 80;
      item.engagement = Math.round(avgAdherence + (Math.random() * 10 - 5)); // Add some variance
    });

    // Today's Schedule
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysSchedule = courses.filter(c => c.schedule?.days?.includes(today)).map(c => ({
      class: c.title,
      time: `${c.schedule.startTime} - ${c.schedule.endTime}`,
      students: c.students.length
    }));

    // Pending Reviews
    const pendingReviews = assignments.map(a => {
      const pending = a.submissions.filter(s => s.grade === undefined).length;
      if (pending > 0) {
        return {
          assignment: a.title,
          submissions: a.submissions.length - pending,
          pending: pending
        };
      }
      return null;
    }).filter(a => a !== null).slice(0, 3);

    // Calculate Performance (Avg Grade)
    const gradedSubmissions = assignments.flatMap(a => a.submissions.filter(s => s.grade !== undefined));
    const avgPerformance = gradedSubmissions.length > 0 
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length)
      : 85; // Default if no grades

    // At Risk Students
    const allStudentProfiles = await StudentProfile.find({ studentId: { $in: uniqueStudents } }).populate('studentId', 'name');
    const atRiskStudents = allStudentProfiles.filter(p => p.stressRisk === 'high' || p.engagementLevel === 'low').map(p => ({
      name: p.studentId?.name || 'Unknown',
      grade: 'N/A', // Need actual grades for this student
      attendance: `${p.studentId?.timetableAdherence || 75}%`,
      risk: p.stressRisk === 'high' ? 'High' : 'Medium'
    })).slice(0, 3);

    // Top Performers (Mocking for now based on average grade)
    const topPerformers = uniqueStudents.map(studentId => {
      const studentSubmissions = gradedSubmissions.filter(s => s.student.toString() === studentId.toString());
      const avgGrade = studentSubmissions.length > 0
        ? studentSubmissions.reduce((sum, s) => sum + s.grade, 0) / studentSubmissions.length
        : 0;
      return {
        id: studentId,
        avgGrade
      };
    }).sort((a, b) => b.avgGrade - a.avgGrade).slice(0, 3);

    const topPerformersDetails = await Promise.all(topPerformers.map(async (p) => {
      const user = await User.findById(p.id).select('name');
      return {
        name: user?.name || 'Unknown',
        grade: `${Math.round(p.avgGrade)}%`,
        improvement: '+5%'
      };
    }));

    // Subject Performance
    const subjectPerformance = courses.map(course => {
      const courseAssignments = assignments.filter(a => a.course.toString() === course._id.toString());
      const courseSubmissions = courseAssignments.flatMap(a => a.submissions.filter(s => s.grade !== undefined));
      const avgGrade = courseSubmissions.length > 0
        ? Math.round(courseSubmissions.reduce((sum, s) => sum + s.grade, 0) / courseSubmissions.length)
        : 85;
      return {
        subject: course.title,
        avgGrade,
        trend: 'up'
      };
    });

    res.json({
      coursesCount: courses.length,
      studentsCount: uniqueStudents.length,
      pendingAssignmentsCount: pendingToGrade.length,
      performance: `${avgPerformance}%`,
      submissionTrends,
      participationData,
      assignmentStatusData,
      engagementHeatmapData,
      todaysSchedule,
      pendingReviews,
      atRiskStudents,
      topPerformers: topPerformersDetails,
      subjectPerformance,
      recentActivity: [] 
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
    const { title, description, dueDate, totalPoints, type } = req.body;

    console.log('Creating assignment with body:', req.body);
    console.log('Course ID:', req.params.courseId);
    console.log('Teacher ID:', req.user.id);

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'Due date is required' });
    }

    const dueDateTime = new Date(dueDate);
    if (isNaN(dueDateTime.getTime())) {
      return res.status(400).json({ message: 'Invalid due date format' });
    }

    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user.id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const assignment = new Assignment({
      title: title.trim(),
      description: description.trim(),
      course: req.params.courseId,
      teacher: req.user.id,
      dueDate: dueDateTime,
      totalPoints: totalPoints || 100,
      type: type || 'homework',
      status: 'published'
    });

    await assignment.save();
    console.log('Assignment created successfully:', assignment._id);

    // Add assignment to course
    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ 
      message: 'Failed to create assignment', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`) : []
    });
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