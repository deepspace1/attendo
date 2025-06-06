const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Teacher = require('./Teacher');
const Course = require('./Course');
const Student = require('./Student');
const Attendance = require('./Attendance');
const AttendanceSummary = require('./AttendanceSummary');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔍 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data based on your requirements
const teachersData = [
  {
    name: 'Akshata Bhayyar',
    email: 'akshata.bhayyar@msrit.edu',
    employeeId: 'EMP001',
    department: 'Computer Science Engineering',
    designation: 'Assistant Professor'
  },
  {
    name: 'Brunda G',
    email: 'brundag@msrit.edu',
    employeeId: 'EMP002',
    department: 'Computer Science Engineering',
    designation: 'Assistant Professor'
  },
  {
    name: 'Dr. Sangeetha V',
    email: 'drsangeethav@msrit.edu',
    employeeId: 'EMP003',
    department: 'Computer Science Engineering',
    designation: 'Dr.'
  },
  {
    name: 'Ganeshayya Shidaganti',
    email: 'ganeshayyashidaganti@msrit.edu',
    employeeId: 'EMP004',
    department: 'Computer Science Engineering',
    designation: 'Professor'
  },
  {
    name: 'Parkavi A',
    email: 'parkavi.a@msrit.edu',
    employeeId: 'EMP005',
    department: 'Computer Science Engineering',
    designation: 'Assistant Professor'
  },
  {
    name: 'Geetha J',
    email: 'geetha@msrit.edu',
    employeeId: 'EMP006',
    department: 'Computer Science Engineering',
    designation: 'Assistant Professor'
  }
];

const coursesData = [
  {
    courseCode: '22AL61',
    courseName: 'Management & Entrepreneurship',
    semester: 6,
    department: 'Computer Science Engineering',
    credits: 3,
    courseType: 'Theory',
    academicYear: '2023-24'
  },
  {
    courseCode: '22CSL65',
    courseName: 'Web Technologies Laboratory',
    semester: 6,
    department: 'Computer Science Engineering',
    credits: 2,
    courseType: 'Laboratory',
    academicYear: '2023-24'
  },
  {
    courseCode: '22CSL66',
    courseName: 'Unix System Programming Laboratory',
    semester: 6,
    department: 'Computer Science Engineering',
    credits: 2,
    courseType: 'Laboratory',
    academicYear: '2023-24'
  },
  {
    courseCode: '22CS62',
    courseName: 'Cloud Computing and Big Data',
    semester: 6,
    department: 'Computer Science Engineering',
    credits: 4,
    courseType: 'Theory',
    academicYear: '2023-24'
  },
  {
    courseCode: '22CSE635',
    courseName: 'Block Chain and Distributed App Development',
    semester: 6,
    department: 'Computer Science Engineering',
    credits: 3,
    courseType: 'Theory',
    academicYear: '2023-24'
  },
  {
    courseCode: '22CSE641',
    courseName: 'Introduction to DevSecOps',
    semester: 6,
    department: 'Computer Science Engineering',
    credits: 3,
    courseType: 'Theory',
    academicYear: '2023-24'
  }
];

// Real students data from CSE Section B
const studentsData = [
  { name: "Kartik Vinay Hegee", usn: "1MS22CS076", rollNumber: "22CS125", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Hariprasad B R", usn: "1MS22CS057", rollNumber: "22CS069", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Chahat Kashwani", usn: "1MS22CS171", rollNumber: "22CS178", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Jaiveer Singh", usn: "1MS22CS071", rollNumber: "22CS153", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Ishika Mohol", usn: "1MS22CS069", rollNumber: "22CS032", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Harsha Rani C", usn: "1MS22CS059", rollNumber: "22CS127", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Nikhil Kalloli", usn: "1MS22CS091", rollNumber: "22CS142", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Pratyush Pai", usn: "1MS22CS107", rollNumber: "22CS012", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Nitin Maruti Paramkar", usn: "1MS22CS095", rollNumber: "22CS141", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Prajwal Paladugu", usn: "1MS22CS103", rollNumber: "22CS169", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Manvendra Singh", usn: "1MS22CS084", rollNumber: "22CS111", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Nihareeka Mohanty", usn: "1MS22CS090", rollNumber: "22CS145", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "P Nitya Reddy", usn: "1MS22CS098", rollNumber: "22CS015", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Harshita Purohit", usn: "1MS22CS060", rollNumber: "22CS168", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "N Radhesh Shetty", usn: "1MS22CS087", rollNumber: "22CS068", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "khyati", usn: "1MS22CS172", rollNumber: "22CS181", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Pavithra K V", usn: "1MS22CS102", rollNumber: "22CS154", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "J D Raghu Veer", usn: "1MS22CS070", rollNumber: "22CS062", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Ifrah Naaz", usn: "1MS22CS064", rollNumber: "22CS074", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Pawan", usn: "1MS22CS086", rollNumber: "22CS030", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Lekhya Biridepalli", usn: "1MS22CS079", rollNumber: "22CS028", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Nirmith M R", usn: "1MS22CS093", rollNumber: "22CS058", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "manas karir", usn: "1MS22CS081", rollNumber: "22CS109", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Mallikarjun", usn: "1MS22CS080", rollNumber: "22CS159", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Isha gupta", usn: "1MS22CS066", rollNumber: "22CS115", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Hoor Parvaiz", usn: "1MS22CS062", rollNumber: "22CS167", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Joshua Abhishek Leo", usn: "1MS22CS086", rollNumber: "22CS086", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "KUWAR AKSHAT", usn: "1MS22CS078", rollNumber: "22CS064", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true },
  { name: "Pavan Kumar M", usn: "1MS22CS101", rollNumber: "22CS068", section: "B", department: "Computer Science Engineering", semester: 6, academicYear: "2023-24", isActive: true }
];

// Main insertion function
const insertData = async () => {
  try {
    console.log('📝 Inserting data (skipping duplicates)...');

    console.log('👨‍🏫 Inserting teachers...');
    // Insert teachers with duplicate prevention
    const teachers = [];
    for (const teacherData of teachersData) {
      const existingTeacher = await Teacher.findOne({ email: teacherData.email });
      if (!existingTeacher) {
        const teacher = await Teacher.create(teacherData);
        teachers.push(teacher);
      } else {
        teachers.push(existingTeacher);
        console.log(`⚠️ Teacher ${teacherData.name} already exists, skipping...`);
      }
    }
    console.log(`✅ Processed ${teachers.length} teachers`);

    console.log('📚 Inserting courses...');
    // Insert courses with duplicate prevention
    const courses = [];
    for (let i = 0; i < coursesData.length; i++) {
      const courseData = { ...coursesData[i], teacherId: teachers[i]._id };
      const existingCourse = await Course.findOne({ courseCode: courseData.courseCode });
      if (!existingCourse) {
        const course = await Course.create(courseData);
        courses.push(course);
      } else {
        courses.push(existingCourse);
        console.log(`⚠️ Course ${courseData.courseCode} already exists, skipping...`);
      }
    }
    console.log(`✅ Processed ${courses.length} courses`);

    console.log('👨‍🎓 Inserting students...');
    // Transform student data to match the schema
    const studentsWithCorrectFormat = studentsData.map(student => ({
      rollNumber: student.usn, // USN becomes rollNumber in DB
      name: student.name,
      email: `${student.usn.toLowerCase()}@msrit.edu`,
      department: student.department,
      class: `CSE-6${student.section}`, // Create class from section (CSE-6B)
      section: student.section,
      semester: student.semester,
      academicYear: student.academicYear,
      barcodeId: student.rollNumber, // rollNumber becomes barcodeId (what gets scanned)
      isActive: student.isActive
    }));

    // Insert students with duplicate prevention
    const students = [];
    for (const studentData of studentsWithCorrectFormat) {
      const existingStudent = await Student.findOne({
        $or: [
          { rollNumber: studentData.rollNumber },
          { barcodeId: studentData.barcodeId }
        ]
      });
      if (!existingStudent) {
        const student = await Student.create(studentData);
        students.push(student);
      } else {
        students.push(existingStudent);
        console.log(`⚠️ Student ${studentData.name} already exists, skipping...`);
      }
    }
    console.log(`✅ Processed ${students.length} students`);

    console.log('📝 Inserting sample attendance records...');
    const sampleAttendance = [
      {
        studentId: students[0]._id,
        courseId: courses[0]._id,
        teacherId: teachers[0]._id,
        status: 'Present',
        session: 'FN',
        location: 'Room 101',
        semester: 6,
        academicYear: '2023-24'
      },
      {
        studentId: students[1]._id,
        courseId: courses[1]._id,
        teacherId: teachers[1]._id,
        status: 'Present',
        session: 'AN',
        location: 'Lab 201',
        semester: 6,
        academicYear: '2023-24'
      }
    ];
    const attendance = await Attendance.insertMany(sampleAttendance);
    console.log(`✅ Inserted ${attendance.length} attendance records`);

    console.log('📊 Inserting sample attendance summaries...');
    const sampleSummaries = [
      {
        studentId: students[0]._id,
        courseId: courses[0]._id,
        totalPresent: 18,
        totalClasses: 20,
        academicYear: '2023-24',
        semester: 6
      },
      {
        studentId: students[1]._id,
        courseId: courses[1]._id,
        totalPresent: 15,
        totalClasses: 18,
        academicYear: '2023-24',
        semester: 6
      }
    ];
    // Insert summaries with duplicate prevention
    const summaries = [];
    for (const summaryData of sampleSummaries) {
      const existingSummary = await AttendanceSummary.findOne({
        studentId: summaryData.studentId,
        courseId: summaryData.courseId,
        academicYear: summaryData.academicYear,
        semester: summaryData.semester
      });
      if (!existingSummary) {
        const summary = await AttendanceSummary.create(summaryData);
        summaries.push(summary);
      } else {
        summaries.push(existingSummary);
        console.log(`⚠️ Attendance summary already exists, skipping...`);
      }
    }
    console.log(`✅ Processed ${summaries.length} attendance summaries`);

    console.log('\n🎉 Data insertion completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`- Teachers: ${teachers.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Attendance Records: ${attendance.length}`);
    console.log(`- Attendance Summaries: ${summaries.length}`);

  } catch (error) {
    console.error('❌ Error inserting data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await insertData();
};

main();
