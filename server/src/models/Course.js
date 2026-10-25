const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  durationHours: {
    type: Number,
    required: [true, 'Module duration in hours is required'],
    min: [1, 'Duration must be at least 1 hour'],
  },
  description: {
    type: String,
    trim: true,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Course title cannot exceed 120 characters'],
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required (e.g., ICT-FS101)'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned instructor is required'],
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits cannot exceed 6'],
      default: 3,
    },
    maxCapacity: {
      type: Number,
      default: 40,
      min: [1, 'Capacity must be at least 1'],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    modules: {
      type: [moduleSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for enrolled count (optional lookup)
courseSchema.virtual('enrolledCount', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  count: true,
});

module.exports = mongoose.model('Course', courseSchema);
