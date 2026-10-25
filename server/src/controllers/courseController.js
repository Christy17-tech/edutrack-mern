const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses with pagination, search, and filtering
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 9, 30);
    const skip = (page - 1) * limit;

    const query = {};

    // Search filter (title, code, description)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
      ];
    }

    // Department filter
    if (req.query.department && req.query.department !== 'All') {
      query.department = req.query.department;
    }

    // Level filter
    if (req.query.level && req.query.level !== 'All') {
      query.level = req.query.level;
    }

    // Status filter (public only sees active; admin/trainer can view all)
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = 'active';
    }

    // Instructor filter
    if (req.query.instructor) {
      query.instructor = req.query.instructor;
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'instructor',
      'name email department'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id ${req.params.id}`,
      });
    }

    // Also get enrollment count
    const enrolledStudentsCount = await Enrollment.countDocuments({
      course: course._id,
      status: { $ne: 'dropped' },
    });

    res.status(200).json({
      success: true,
      course: {
        ...course.toObject(),
        enrolledCount: enrolledStudentsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, code, description, department, credits, maxCapacity, level, modules, instructor } = req.body;

    if (!title || !code || !description || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, code, description, department).',
      });
    }

    // Check course code uniqueness
    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A course with code ${code.toUpperCase()} already exists.`,
      });
    }

    // Instructor assignment
    let assignedInstructor = req.user._id;
    if (req.user.role === 'admin' && instructor) {
      assignedInstructor = instructor;
    }

    const course = await Course.create({
      title,
      code: code.toUpperCase(),
      description,
      department,
      credits: credits || 3,
      maxCapacity: maxCapacity || 40,
      level: level || 'Intermediate',
      modules: modules || [],
      instructor: assignedInstructor,
      status: 'active',
    });

    const populatedCourse = await Course.findById(course._id).populate(
      'instructor',
      'name email department'
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course: populatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor owner, Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id ${req.params.id}`,
      });
    }

    // Ownership check (Section 6.6)
    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update courses you instruct.',
      });
    }

    // Check code collision if code updated
    if (req.body.code && req.body.code.toUpperCase() !== course.code) {
      const existing = await Course.findOne({ code: req.body.code.toUpperCase() });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Course code ${req.body.code.toUpperCase()} is already in use.`,
        });
      }
      req.body.code = req.body.code.toUpperCase();
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('instructor', 'name email department');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id ${req.params.id}`,
      });
    }

    // Remove associated enrollments
    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course and related enrollments removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
