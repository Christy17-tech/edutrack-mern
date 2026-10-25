const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollments,
  updateGrade,
  dropEnrollment,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), enrollInCourse);
router.get('/my', protect, getMyEnrollments);
router.get('/course/:courseId', protect, authorize('admin', 'instructor'), getCourseEnrollments);
router.patch('/:id/grade', protect, authorize('admin', 'instructor'), updateGrade);
router.delete('/:id', protect, dropEnrollment);

module.exports = router;
