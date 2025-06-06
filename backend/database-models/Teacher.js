const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  employeeId: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    sparse: true,
    default: function() {
      return `EMP${Date.now()}`;
    }
  },
  department: {
    type: String,
    required: true,
    trim: true,
    default: 'Computer Science Engineering'
  },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Dr.'],
    default: 'Assistant Professor'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'teachers'
});

// Indexes for efficient queries
teacherSchema.index({ email: 1 });
teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ department: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);
