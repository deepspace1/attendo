const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/attender', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function createAttendance() {
  try {
    // First, get some students
    const students = await Student.find().limit(10);
    if (students.length === 0) {
      console.log('No students found. Please create students first.');
      return;
    }

    // Create attendance records
    const attendanceData = [
      {
        date: new Date(Date.UTC(2024, 4, 21)), // 2024-05-21T00:00:00.000Z
        class: 'CSE-2',
        subject: 'Web Development',
        teacher: 'Dr. Smith',
        records: students.map(student => ({
          student: student._id,
          status: Math.random() > 0.3 ? 'present' : 'absent', // 70% present
          timestamp: new Date()
        }))
      },
      {
        date: new Date(Date.UTC(2024, 4, 21)),
        class: 'CSE-2',
        subject: 'Data Structures',
        teacher: 'Dr. Johnson',
        records: students.map(student => ({
          student: student._id,
          status: Math.random() > 0.3 ? 'present' : 'absent',
          timestamp: new Date()
        }))
      },
      {
        date: new Date(Date.UTC(2024, 4, 20)),
        class: 'CSE-2',
        subject: 'Web Development',
        teacher: 'Dr. Smith',
        records: students.map(student => ({
          student: student._id,
          status: Math.random() > 0.3 ? 'present' : 'absent',
          timestamp: new Date()
        }))
      }
    ];

    // Clear existing attendance records
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records');

    // Insert new records
    const result = await Attendance.insertMany(attendanceData);
    console.log(`Created ${result.length} attendance records`);

    // Verify the data
    const allRecords = await Attendance.find({});
    console.log('Sample records created:');
    allRecords.forEach(record => {
      console.log({
        date: record.date,
        class: record.class,
        subject: record.subject,
        recordsCount: record.records.length
      });
    });

  } catch (error) {
    console.error('Error creating attendance records:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createAttendance(); 