const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all students (with search & pagination)
// @route   GET /api/users/students
// @access  Private (Instructor, Admin)
exports.getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const query = { role: 'student' };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { department: searchRegex }];
    }

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all instructors for dropdown selection
// @route   GET /api/users/instructors
// @access  Public / Private
exports.getInstructors = async (req, res, next) => {
  try {
    const instructors = await User.find({ role: { $in: ['instructor', 'admin'] } })
      .select('name email department')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      instructors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get role-specific dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let stats = {};

    if (userRole === 'student') {
      const myEnrollments = await Enrollment.find({
        student: userId,
        status: { $ne: 'dropped' },
      });

      const completed = myEnrollments.filter((e) => e.status === 'completed');
      const inProgress = myEnrollments.filter((e) => e.status === 'in-progress' || e.status === 'enrolled');

      // Calculate average score for graded enrollments
      const graded = myEnrollments.filter((e) => typeof e.score === 'number');
      const avgScore = graded.length > 0
        ? Math.round(graded.reduce((acc, curr) => acc + curr.score, 0) / graded.length)
        : 0;

      stats = {
        totalEnrolled: myEnrollments.length,
        inProgressCount: inProgress.length,
        completedCount: completed.length,
        averageScore: avgScore,
      };
    } else if (userRole === 'instructor') {
      const myCourses = await Course.find({ instructor: userId });
      const courseIds = myCourses.map((c) => c._id);

      const enrollments = await Enrollment.find({
        course: { $in: courseIds },
        status: { $ne: 'dropped' },
      });

      const pendingGrades = enrollments.filter((e) => e.grade === 'Pending');

      stats = {
        coursesTaught: myCourses.length,
        totalStudentsEnrolled: enrollments.length,
        pendingGradesCount: pendingGrades.length,
        completedAssessments: enrollments.length - pendingGrades.length,
      };
    } else if (userRole === 'admin') {
      const totalCourses = await Course.countDocuments();
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalInstructors = await User.countDocuments({ role: 'instructor' });
      const totalEnrollments = await Enrollment.countDocuments({ status: { $ne: 'dropped' } });

      stats = {
        totalCourses,
        totalStudents,
        totalInstructors,
        totalEnrollments,
      };
    }

    res.status(200).json({
      success: true,
      role: userRole,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
