const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: false // Optional as it can be derived from course
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true,
    default: 'Present'
  },
  session: {
    type: String,
    enum: ['FN', 'AN'], // Forenoon, Afternoon
    required: true
  },
  location: {
    type: String,
    trim: true,
    default: 'Main Campus'
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
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
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'attendance'
});

// Compound indexes for efficient queries
attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 });
attendanceSchema.index({ courseId: 1, date: 1, session: 1 });
attendanceSchema.index({ teacherId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ academicYear: 1, semester: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
