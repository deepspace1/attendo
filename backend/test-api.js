const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./database-models/Student');
const Course = require('./database-models/Course');
const Teacher = require('./database-models/Teacher');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test API functions
const testAPIs = async () => {
  try {
    console.log('🧪 Testing API functions...\n');

    // Test 1: Get departments
    console.log('📊 Test 1: Get Departments');
    const departments = await Student.distinct('department');
    console.log('Departments:', departments);

    // Test 2: Get sections for a department
    console.log('\n📊 Test 2: Get Sections for CSE');
    const sections = await Student.distinct('section', { department: 'Computer Science Engineering' });
    console.log('Sections:', sections);

    // Test 3: Get students by department and section
    console.log('\n📊 Test 3: Get Students by Department and Section');
    const students = await Student.find({ 
      department: 'Computer Science Engineering', 
      section: 'B' 
    }).limit(5);
    console.log(`Found ${students.length} students in CSE Section B`);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.rollNumber}) - Barcode: ${student.barcodeId}`);
    });

    // Test 4: Get courses/subjects
    console.log('\n📊 Test 4: Get Courses/Subjects');
    const courses = await Course.find({ department: 'Computer Science Engineering' });
    console.log(`Found ${courses.length} courses for CSE`);
    courses.forEach(course => {
      console.log(`- ${course.courseCode}: ${course.courseName}`);
    });

    // Test 5: Get teachers
    console.log('\n📊 Test 5: Get Teachers');
    const teachers = await Teacher.find({ isActive: true });
    console.log(`Found ${teachers.length} teachers`);
    teachers.forEach(teacher => {
      console.log(`- ${teacher.name} (${teacher.department})`);
    });

    // Test 6: Test barcode lookup
    console.log('\n📊 Test 6: Test Barcode Lookup');
    const testBarcodes = ['22CS125', '22CS069', '22CS178'];
    for (const barcode of testBarcodes) {
      const student = await Student.findOne({ barcodeId: barcode });
      if (student) {
        console.log(`✅ Barcode ${barcode} found: ${student.name} (${student.rollNumber})`);
      } else {
        console.log(`❌ Barcode ${barcode} not found`);
      }
    }

    // Test 7: Test new admin APIs
    console.log('\n🔧 Test 7: Test Admin APIs');

    // Test departments API
    try {
      const deptResponse = await fetch('http://localhost:5000/api/departments');
      if (deptResponse.ok) {
        const departments = await deptResponse.json();
        console.log(`✅ Departments API working: ${departments.length} departments found`);
      } else {
        console.log('❌ Departments API not working');
      }
    } catch (error) {
      console.log('❌ Departments API error:', error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Error running tests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Main function
const main = async () => {
  await connectDB();
  await testAPIs();
};

// Run if called directly
if (require.main === module) {
  main();
}
