const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true, // Allows multiple null values
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    default: 'Computer Science Engineering'
  },
  class: {
    type: String,
    required: false,
    trim: true,
    default: function() {
      return `${this.department.split(' ').map(word => word[0]).join('')}-${this.semester}${this.section}`;
    }
  },
  section: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  academicYear: {
    type: String,
    required: true,
    default: '2023-24'
  },
  barcodeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentContact: {
    name: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true,
  collection: 'students'
});

// Indexes for efficient queries
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ barcodeId: 1 });
studentSchema.index({ department: 1, semester: 1, section: 1 });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ academicYear: 1 });

module.exports = mongoose.model('Student', studentSchema);
