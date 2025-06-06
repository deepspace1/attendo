const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: false
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  department: {
    type: String,
    required: true,
    trim: true,
    default: 'Computer Science Engineering'
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    default: 3
  },
  courseType: {
    type: String,
    enum: ['Theory', 'Laboratory', 'Project', 'Seminar'],
    default: 'Theory'
  },
  academicYear: {
    type: String,
    required: true,
    default: '2023-24'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'courses'
});

// Indexes for efficient queries
courseSchema.index({ courseCode: 1 });
courseSchema.index({ teacherId: 1 });
courseSchema.index({ semester: 1, department: 1 });
courseSchema.index({ academicYear: 1 });

module.exports = mongoose.model('Course', courseSchema);
