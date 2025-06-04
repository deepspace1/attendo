const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('../models/Student');

// Use environment variable or default to localhost
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attend';

// Test students with barcode IDs
const testStudents = [
  {
    rollNumber: 'CS001',
    name: 'John Doe',
    class: 'CS-A',
    barcodeId: '123456789'
  },
  {
    rollNumber: 'CS002',
    name: 'Jane Smith',
    class: 'CS-A',
    barcodeId: '987654321'
  },
  {
    rollNumber: 'CS003',
    name: 'Mike Johnson',
    class: 'CS-A',
    barcodeId: '456789123'
  },
  {
    rollNumber: 'CS004',
    name: 'Sarah Wilson',
    class: 'CS-A',
    barcodeId: '789123456'
  },
  {
    rollNumber: 'CS005',
    name: 'David Brown',
    class: 'CS-A',
    barcodeId: '321654987'
  }
];

async function createTestStudents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing test students
    console.log('Clearing existing test students...');
    await Student.deleteMany({ class: 'CS-A' });

    // Create new test students
    console.log('Creating test students with barcode IDs...');
    for (const studentData of testStudents) {
      const student = new Student(studentData);
      await student.save();
      console.log(`Created student: ${student.name} (${student.rollNumber}) - Barcode: ${student.barcodeId}`);
    }

    console.log('\n✅ Test students created successfully!');
    console.log('\nYou can now test the barcode scanner with these codes:');
    testStudents.forEach(student => {
      console.log(`- ${student.barcodeId} → ${student.name} (${student.rollNumber})`);
    });

    console.log('\nTo test:');
    console.log('1. Open http://localhost/native-camera.html on your mobile');
    console.log('2. Start scanning');
    console.log('3. Scan any of the above barcode numbers');

  } catch (error) {
    console.error('Error creating test students:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createTestStudents();
