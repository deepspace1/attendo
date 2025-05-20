/**
 * Comprehensive test for the attendance system
 * This test:
 * 1. Creates a test student
 * 2. Creates an attendance session
 * 3. Marks the student as present
 * 4. Verifies the status is saved correctly
 * 5. Cleans up the test data
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// Use environment variable or default to localhost
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attender';

// Test data
const testStudent = {
  rollNumber: 'TEST001',
  name: 'Test Student',
  class: 'TEST-CLASS',
  barcodeId: 'TEST001'
};

const testAttendance = {
  class: 'TEST-CLASS',
  subject: 'TEST-SUBJECT',
  teacher: 'Test Teacher'
};

// Function to run the test
async function runAttendanceTest() {
  console.log('Starting attendance test...');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
    // Step 1: Clean up any previous test data
    console.log('\nCleaning up previous test data...');
    await Student.deleteOne({ rollNumber: testStudent.rollNumber });
    await Attendance.deleteMany({ class: testAttendance.class, subject: testAttendance.subject });
    console.log('Previous test data cleaned up');
    
    // Step 2: Create a test student
    console.log('\nCreating test student...');
    const student = new Student(testStudent);
    await student.save();
    console.log(`Test student created with ID: ${student._id}`);
    
    // Step 3: Create an attendance session
    console.log('\nCreating attendance session...');
    const attendance = new Attendance({
      date: new Date(),
      class: testAttendance.class,
      subject: testAttendance.subject,
      teacher: testAttendance.teacher,
      records: [{
        student: student._id,
        status: 'absent', // Initially absent
        timestamp: new Date()
      }]
    });
    await attendance.save();
    console.log(`Attendance session created with ID: ${attendance._id}`);
    
    // Step 4: Mark the student as present
    console.log('\nMarking student as present...');
    const record = attendance.records.find(r => r.student.toString() === student._id.toString());
    if (record) {
      record.status = 'present';
      record.timestamp = new Date();
      await attendance.save();
      console.log('Student marked as present');
    } else {
      throw new Error('Student record not found in attendance');
    }
    
    // Step 5: Verify the status is saved correctly
    console.log('\nVerifying attendance status...');
    const updatedAttendance = await Attendance.findById(attendance._id);
    const updatedRecord = updatedAttendance.records.find(r => r.student.toString() === student._id.toString());
    
    if (updatedRecord && updatedRecord.status === 'present') {
      console.log('✅ TEST PASSED: Student was correctly marked as present');
    } else {
      console.error('❌ TEST FAILED: Student was not marked as present');
      process.exit(1);
    }
    
    // Step 6: Clean up test data
    console.log('\nCleaning up test data...');
    await Student.deleteOne({ _id: student._id });
    await Attendance.deleteOne({ _id: attendance._id });
    console.log('Test data cleaned up');
    
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
runAttendanceTest();
