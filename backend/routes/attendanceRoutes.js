const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Debug route to check database contents
router.get('/debug', async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    const Student = require('../models/Student');
    
    // Get all attendance records
    const allAttendance = await Attendance.find()
      .sort({ date: -1 });
    
    // Get the exact format of dates
    const dateFormats = allAttendance.map(a => ({
      id: a._id,
      date: a.date,
      dateType: typeof a.date,
      dateString: a.date.toString(),
      isoString: a.date.toISOString(),
      class: a.class,
      subject: a.subject
    }));

    res.json({
      totalRecords: allAttendance.length,
      dateFormats,
      sampleRecord: allAttendance[0] ? {
        id: allAttendance[0]._id,
        date: allAttendance[0].date,
        class: allAttendance[0].class,
        subject: allAttendance[0].subject,
        records: allAttendance[0].records.length
      } : null
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get suggestions for classes, subjects, and dates
router.get('/suggestions', attendanceController.getSuggestions);

// Get attendance records with filters
router.get('/records', attendanceController.getAttendanceRecords);

// Get detailed attendance record
router.get('/records/:id', attendanceController.getAttendanceRecordDetails);

// Create new attendance session
router.post('/session', attendanceController.createAttendanceSession);

// Mark student present
router.post('/mark-present', attendanceController.markPresent);

module.exports = router; 