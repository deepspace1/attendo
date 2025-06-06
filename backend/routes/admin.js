const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get comprehensive dashboard data
router.get('/dashboard', adminController.getDashboardData);

// Get detailed data with pagination
router.get('/students', adminController.getAllStudentsDetailed);
router.get('/teachers', adminController.getAllTeachersDetailed);
router.get('/courses', adminController.getAllCoursesDetailed);
router.get('/attendance-sessions', adminController.getAttendanceSessionsDetailed);

// Search and attendance APIs
router.get('/search/students', adminController.searchStudents);
router.get('/attendance/by-student', adminController.getAttendanceByStudent);
router.get('/attendance/by-subject', adminController.getAttendanceBySubject);

module.exports = router;
