const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Create new attendance session
router.post('/session', attendanceController.createAttendanceSession);

// Mark student present
router.post('/mark-present', attendanceController.markPresent);

// Get attendance by date and class
router.get('/by-date', attendanceController.getAttendanceByDateAndClass);

// Get attendance records by date, class, and subject (old)
router.get('/records-old', attendanceController.getAttendanceRecords);

// Get attendance records by date, department, section, and subject (new)
router.get('/records', attendanceController.getRecords);

// Get individual attendance record
router.get('/records/:id', attendanceController.getAttendanceRecordDetails);

// Submit attendance
router.post('/submit/:attendanceId', attendanceController.submitAttendance);

// Get recent attendance sessions (for dashboard)
router.get('/recent', attendanceController.getRecentSessions);

// Get all attendance sessions
router.get('/', attendanceController.getAllSessions);

// Get subject-wise attendance (all students for one subject)
router.get('/subject-wise', attendanceController.getSubjectWiseAttendance);

// Get student-wise attendance (one student, all subjects)
router.get('/student-wise', attendanceController.getStudentWiseAttendance);

// Get class overview (all subjects for a class)
router.get('/class-overview', attendanceController.getClassOverview);

module.exports = router;