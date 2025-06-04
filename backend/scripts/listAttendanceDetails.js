const mongoose = require('mongoose');
require('dotenv').config();
const Attendance = require('../models/Attendance');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attend';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function listAttendanceDetails() {
  try {
    // Fetch all attendance records and populate student details
    const records = await Attendance.find({})
      .populate('records.student', 'rollNumber name')
      .sort({ date: -1 });

    console.log('Attendance Records:');
    records.forEach(record => {
      console.log(`\nDate: ${record.date.toISOString().split('T')[0]}`);
      console.log(`Class: ${record.class}`);
      console.log(`Subject: ${record.subject}`);
      console.log(`Teacher: ${record.teacher}`);
      console.log('Student Details:');
      record.records.forEach(r => {
        console.log(`  - ${r.student.name} (${r.student.rollNumber}): ${r.status}`);
      });
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

listAttendanceDetails(); 