const express = require('express');
const router = express.Router();
const { getStudents, getInstructors } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/students', protect, authorize('admin', 'instructor'), getStudents);
router.get('/instructors', getInstructors);

module.exports = router;
