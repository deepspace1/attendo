const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Teacher = require('./Teacher');
const Course = require('./Course');
const Student = require('./Student');
const Attendance = require('./Attendance');
const AttendanceSummary = require('./AttendanceSummary');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Query 1: Get attendance count for a specific student in a specific course
const getStudentCourseAttendance = async (studentId, courseId) => {
  try {
    const result = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          courseId: new mongoose.Types.ObjectId(courseId),
          status: 'Present'
        }
      },
      {
        $group: {
          _id: {
            studentId: '$studentId',
            courseId: '$courseId'
          },
          totalPresent: { $sum: 1 },
          sessions: { $push: '$session' },
          dates: { $push: '$date' }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id.studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $project: {
          studentName: { $arrayElemAt: ['$student.name', 0] },
          studentRoll: { $arrayElemAt: ['$student.rollNumber', 0] },
          courseName: { $arrayElemAt: ['$course.courseName', 0] },
          courseCode: { $arrayElemAt: ['$course.courseCode', 0] },
          totalPresent: 1,
          sessions: 1,
          dates: 1
        }
      }
    ]);

    return result;
  } catch (error) {
    console.error('Error in getStudentCourseAttendance:', error);
    throw error;
  }
};

// Query 2: Get attendance summary for all students in a course
const getCourseAttendanceSummary = async (courseId) => {
  try {
    const result = await Attendance.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $group: {
          _id: '$studentId',
          totalClasses: { $sum: 1 },
          totalPresent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Present'] }, 1, 0]
            }
          },
          totalAbsent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $project: {
          studentName: { $arrayElemAt: ['$student.name', 0] },
          studentRoll: { $arrayElemAt: ['$student.rollNumber', 0] },
          totalClasses: 1,
          totalPresent: 1,
          totalAbsent: 1,
          attendancePercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$totalPresent', '$totalClasses'] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: { attendancePercentage: -1 }
      }
    ]);

    return result;
  } catch (error) {
    console.error('Error in getCourseAttendanceSummary:', error);
    throw error;
  }
};

// Query 3: Get teacher's course attendance overview
const getTeacherAttendanceOverview = async (teacherId) => {
  try {
    const result = await Attendance.aggregate([
      {
        $match: {
          teacherId: new mongoose.Types.ObjectId(teacherId)
        }
      },
      {
        $group: {
          _id: '$courseId',
          totalSessions: { $sum: 1 },
          totalPresent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Present'] }, 1, 0]
            }
          },
          totalAbsent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0]
            }
          },
          uniqueStudents: { $addToSet: '$studentId' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $project: {
          courseName: { $arrayElemAt: ['$course.courseName', 0] },
          courseCode: { $arrayElemAt: ['$course.courseCode', 0] },
          totalSessions: 1,
          totalPresent: 1,
          totalAbsent: 1,
          totalStudents: { $size: '$uniqueStudents' },
          overallAttendanceRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$totalPresent', '$totalSessions'] },
                  100
                ]
              },
              2
            ]
          }
        }
      }
    ]);

    return result;
  } catch (error) {
    console.error('Error in getTeacherAttendanceOverview:', error);
    throw error;
  }
};

// Query 4: Get daily attendance report
const getDailyAttendanceReport = async (date) => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const result = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            courseId: '$courseId',
            session: '$session'
          },
          totalStudents: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Present'] }, 1, 0]
            }
          },
          absentCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $project: {
          courseName: { $arrayElemAt: ['$course.courseName', 0] },
          courseCode: { $arrayElemAt: ['$course.courseCode', 0] },
          session: '$_id.session',
          totalStudents: 1,
          presentCount: 1,
          absentCount: 1,
          attendanceRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$presentCount', '$totalStudents'] },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      {
        $sort: { courseCode: 1, session: 1 }
      }
    ]);

    return result;
  } catch (error) {
    console.error('Error in getDailyAttendanceReport:', error);
    throw error;
  }
};

// Test queries function
const runTestQueries = async () => {
  try {
    console.log('🔍 Running test queries...\n');

    // Get sample data for testing
    const students = await Student.find().limit(2);
    const courses = await Course.find().limit(2);
    const teachers = await Teacher.find().limit(1);

    if (students.length > 0 && courses.length > 0) {
      console.log('📊 Query 1: Student Course Attendance');
      const studentAttendance = await getStudentCourseAttendance(
        students[0]._id,
        courses[0]._id
      );
      console.log(JSON.stringify(studentAttendance, null, 2));

      console.log('\n📊 Query 2: Course Attendance Summary');
      const courseSummary = await getCourseAttendanceSummary(courses[0]._id);
      console.log(JSON.stringify(courseSummary, null, 2));

      if (teachers.length > 0) {
        console.log('\n📊 Query 3: Teacher Attendance Overview');
        const teacherOverview = await getTeacherAttendanceOverview(teachers[0]._id);
        console.log(JSON.stringify(teacherOverview, null, 2));
      }

      console.log('\n📊 Query 4: Daily Attendance Report');
      const dailyReport = await getDailyAttendanceReport(new Date());
      console.log(JSON.stringify(dailyReport, null, 2));
    }

  } catch (error) {
    console.error('❌ Error running test queries:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Main function
const main = async () => {
  await connectDB();
  await runTestQueries();
};

// Export functions for use in other files
module.exports = {
  getStudentCourseAttendance,
  getCourseAttendanceSummary,
  getTeacherAttendanceOverview,
  getDailyAttendanceReport
};

// Run if called directly
if (require.main === module) {
  main();
}
