const mongoose = require('mongoose');

const attendanceSummarySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  totalPresent: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalClasses: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalAbsent: {
    type: Number,
    default: 0,
    min: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  academicYear: {
    type: String,
    required: true,
    default: '2023-24'
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  isEligibleForExam: {
    type: Boolean,
    default: true
  },
  minimumAttendanceRequired: {
    type: Number,
    default: 75 // 75% minimum attendance
  }
}, {
  timestamps: true,
  collection: 'attendance_summary'
});

// Compound unique index to prevent duplicate summaries
attendanceSummarySchema.index({ 
  studentId: 1, 
  courseId: 1, 
  academicYear: 1, 
  semester: 1 
}, { unique: true });

// Other indexes for efficient queries
attendanceSummarySchema.index({ courseId: 1, academicYear: 1 });
attendanceSummarySchema.index({ studentId: 1, academicYear: 1 });
attendanceSummarySchema.index({ attendancePercentage: 1 });

// Pre-save middleware to calculate percentage and eligibility
attendanceSummarySchema.pre('save', function(next) {
  // Calculate attendance percentage
  if (this.totalClasses > 0) {
    this.attendancePercentage = Math.round((this.totalPresent / this.totalClasses) * 100);
  } else {
    this.attendancePercentage = 0;
  }
  
  // Calculate total absent
  this.totalAbsent = this.totalClasses - this.totalPresent;
  
  // Check exam eligibility
  this.isEligibleForExam = this.attendancePercentage >= this.minimumAttendanceRequired;
  
  // Update last modified timestamp
  this.lastUpdated = new Date();
  
  next();
});

module.exports = mongoose.model('AttendanceSummary', attendanceSummarySchema);
