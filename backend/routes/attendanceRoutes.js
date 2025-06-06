const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Debug route to check database contents
router.get('/debug', async (req, res) => {
  try {
    const AttendanceSession = require('../database-models/AttendanceSession');
    
    // Get all attendance records
    const allAttendance = await AttendanceSession.find()
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

// Dashboard stats for dashboard page
router.get('/dashboard-stats', attendanceController.getDashboardStats);

// Get suggestions for classes, subjects, and dates
router.get('/suggestions', attendanceController.getSuggestions);

// Get attendance records with filters (old - class based)
router.get('/records-old', attendanceController.getAttendanceRecords);

// Get attendance records with new filters (department, section, subject)
router.get('/records', attendanceController.getRecords);

// Get subject-wise attendance (all students for one subject)
router.get('/subject-wise', attendanceController.getSubjectWiseAttendance);

// Get student-wise attendance (one student, all subjects)
router.get('/student-wise', attendanceController.getStudentWiseAttendance);

// Get class overview (all subjects for a class)
router.get('/class-overview', attendanceController.getClassOverview);

// Get detailed attendance record
router.get('/records/:id', attendanceController.getAttendanceRecordDetails);

// Create new attendance session
router.post('/session', attendanceController.createAttendanceSession);

// Mark student present
router.post('/mark-present', attendanceController.markPresent);

module.exports = router; 