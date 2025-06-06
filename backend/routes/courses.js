const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Get all courses
router.get('/', courseController.getAllCourses);

// Create new course
router.post('/', courseController.createCourse);

// Get courses by department and semester
router.get('/filter', courseController.getCoursesByDepartment);

// Get subject codes for dropdowns
router.get('/subject-codes', courseController.getSubjectCodes);

// Get course by course code
router.get('/:courseCode', courseController.getCourseByCode);

module.exports = router;
