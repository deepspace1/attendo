const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Create new attendance session
router.post('/session', attendanceController.createAttendanceSession);

// Mark student present
router.post('/mark-present', attendanceController.markPresent);

// Get attendance by date and class
router.get('/by-date', attendanceController.getAttendanceByDateAndClass);

// Get attendance records by date, class, and subject
router.get('/records', attendanceController.getAttendanceRecords);

// Get individual attendance record
router.get('/records/:id', attendanceController.getAttendanceRecordDetails);

// Submit attendance
router.post('/submit/:attendanceId', attendanceController.submitAttendance);

module.exports = router; 