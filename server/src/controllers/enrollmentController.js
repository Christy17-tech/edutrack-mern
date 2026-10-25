const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll logged-in student into a course
// @route   POST /api/enrollments
// @access  Private (Student)
exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required to enroll.',
      });
    }

    const course = await Course.findById(courseId);
    if (!course || course.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Course not found or is not currently open for enrollment.',
      });
    }

    // Check duplicate enrollment (User Story 1 Acceptance Criteria)
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      status: { $ne: 'dropped' },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You are already actively enrolled in this course.',
      });
    }

    // Check course capacity
    const currentEnrolled = await Enrollment.countDocuments({
      course: courseId,
      status: { $ne: 'dropped' },
    });

    if (currentEnrolled >= course.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Course is at maximum enrollment capacity.',
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      status: 'enrolled',
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate('course', 'title code department credits level')
      .populate('student', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's enrollments
// @route   GET /api/enrollments/my
// @access  Private
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title code department credits level description status instructor',
        populate: {
          path: 'instructor',
          select: 'name email department',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students enrolled in a specific course
// @route   GET /api/enrollments/course/:courseId
// @access  Private (Instructor, Admin)
exports.getCourseEnrollments = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Ensure instructor only views own course roster
    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only view enrollment rosters for your own courses.',
      });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email department phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit / Update student grade and feedback
// @route   PATCH /api/enrollments/:id/grade
// @access  Private (Instructor, Admin)
exports.updateGrade = async (req, res, next) => {
  try {
    const { grade, score, feedback, status } = req.body;

    const enrollment = await Enrollment.findById(req.params.id).populate('course');
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment record not found.',
      });
    }

    // Ensure instructor owns this course
    if (
      req.user.role !== 'admin' &&
      enrollment.course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only grade students enrolled in your own courses.',
      });
    }

    // Server-side validation
    const allowedGrades = ['A+', 'A', 'B', 'C', 'D', 'F', 'Pending'];
    if (grade && !allowedGrades.includes(grade)) {
      return res.status(400).json({
        success: false,
        message: `Invalid grade '${grade}'. Allowed values are: ${allowedGrades.join(', ')}`,
      });
    }

    if (score !== undefined && (score < 0 || score > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 0 and 100.',
      });
    }

    if (grade) enrollment.grade = grade;
    if (score !== undefined) enrollment.score = score;
    if (feedback !== undefined) enrollment.feedback = feedback;
    if (status) enrollment.status = status;

    // Automatically mark as completed if final grade given
    if (grade && grade !== 'Pending' && !status) {
      enrollment.status = 'completed';
    }

    await enrollment.save();

    const updated = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email department')
      .populate('course', 'title code');

    res.status(200).json({
      success: true,
      message: 'Grade and evaluation updated successfully.',
      enrollment: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Drop / Withdraw enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private (Student owner, Admin)
exports.dropEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      enrollment.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only drop your own course enrollments.',
      });
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Course enrollment successfully dropped.',
    });
  } catch (error) {
    next(error);
  }
};
