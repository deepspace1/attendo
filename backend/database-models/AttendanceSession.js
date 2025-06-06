const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'absent'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  scannedAt: {
    type: Date
  }
});

const attendanceSessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  subjectCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  teacher: {
    type: String,
    required: true,
    trim: true
  },
  records: [attendanceRecordSchema],
  session: {
    type: String,
    enum: ['FN', 'AN'], // Forenoon, Afternoon
    default: 'FN'
  },
  academicYear: {
    type: String,
    default: '2023-24'
  }
}, {
  timestamps: true,
  collection: 'attendance_sessions'
});

// Indexes for efficient queries
attendanceSessionSchema.index({ date: 1, department: 1, section: 1 });
attendanceSessionSchema.index({ subjectCode: 1, date: 1 });
attendanceSessionSchema.index({ teacher: 1, date: 1 });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
