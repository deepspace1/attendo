const AttendanceSession = require('../database-models/AttendanceSession');
const Student = require('../database-models/Student');

// Create new attendance session
exports.createAttendanceSession = async (req, res) => {
  try {
    const { department, section, subjectCode, teacher, records, date } = req.body;

    // Check if records were provided from the frontend
    let attendanceRecords;

    if (records && Array.isArray(records)) {
      // Use the records provided by the frontend
      console.log('Using attendance records from frontend:', records.length);
      attendanceRecords = records;
    } else {
      // Fallback: Get all students in the department and section and mark them absent
      console.log('No records provided, creating default records');
      const students = await Student.find({ department, section });
      attendanceRecords = students.map(student => ({
        student: student._id,
        status: 'absent'
      }));
    }

    // Create a date object with time set to midnight (00:00:00)
    let attendanceDate;
    if (date) {
      // If date is provided in the request, use it
      attendanceDate = new Date(date);
    } else {
      // Otherwise use current date
      attendanceDate = new Date();
    }
    // Set time to midnight to ensure consistent date comparison
    attendanceDate.setUTCHours(0, 0, 0, 0);

    console.log('Creating attendance record with date:', attendanceDate.toISOString());

    const attendance = new AttendanceSession({
      date: attendanceDate,
      department,
      section,
      subjectCode,
      teacher,
      records: attendanceRecords
    });

    const newAttendance = await attendance.save();
    res.status(201).json(newAttendance);
  } catch (error) {
    console.error('Error creating attendance session:', error);
    res.status(400).json({ message: error.message });
  }
};

// Mark student present
exports.markPresent = async (req, res) => {
    try {
        const { attendanceId, studentId } = req.body;

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance session not found' });
        }

        const record = attendance.records.find(r => r.student.toString() === studentId);
        if (record) {
            record.status = 'present';
            record.scannedAt = new Date();
            await attendance.save();
            res.json(attendance);
        } else {
            res.status(404).json({ message: 'Student not found in attendance records' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get attendance by date and class
exports.getAttendanceByDateAndClass = async (req, res) => {
    try {
        const { date, class: className } = req.query;

        if (!date || !className) {
            return res.status(400).json({
                success: false,
                message: 'Date and class are required'
            });
        }

        // Parse the input date and create start/end dates for the day
        const searchDate = new Date(date);
        if (isNaN(searchDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // Create start and end dates for the day (midnight to midnight)
        const startDate = new Date(searchDate);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(searchDate);
        endDate.setUTCHours(23, 59, 59, 999);

        console.log('Searching for attendance by date and class:', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            class: className
        });

        const attendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate },
            class: className
        }).populate('records.student');

        res.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance by date and class:', error);
        res.status(500).json({ message: error.message });
    }
};

// Submit attendance
exports.submitAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance session not found' });
        }

        // All students not marked present will remain absent
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get suggestions for classes, subjects, and dates
exports.getSuggestions = async (req, res) => {
  try {
    // Get unique classes from students
    const classes = await Student.distinct('class');

    // Get unique subjects and dates from attendance records
    const attendanceData = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          subjects: { $addToSet: '$subject' },
          dates: { $addToSet: '$date' }
        }
      }
    ]);

    const suggestions = {
      classes: classes.sort(),
      subjects: attendanceData[0]?.subjects.sort() || [],
      dates: attendanceData[0]?.dates.sort() || []
    };

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
};

// Get attendance records with filters
exports.getAttendanceRecords = async (req, res) => {
  try {
    const { date, class: className, subject } = req.query;

    if (!date || !className || !subject) {
        return res.status(400).json({
            success: false,
            message: 'Date, class, and subject are required'
        });
    }

    // Parse the input date and create start/end dates for the day
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format'
        });
    }

    // Create start and end dates for the day (midnight to midnight)
    const startDate = new Date(searchDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(searchDate);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log('Searching for attendance between:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        class: className,
        subject: subject
    });

    // Search with date range and other criteria
    const attendanceRecords = await Attendance.find({
        date: { $gte: startDate, $lte: endDate },
        class: className,
        subject: subject
    }).populate('records.student', 'name rollNumber');

    console.log('Found matching records:', attendanceRecords.length);

    // Transform the records to include counts and student details
    const transformedRecords = attendanceRecords.map(record => {
        const presentCount = record.records.filter(r => r.status === 'present').length;
        const absentCount = record.records.filter(r => r.status === 'absent').length;

        return {
            ...record.toObject(),
            presentCount,
            absentCount,
            totalStudents: record.records.length
        };
    });

    res.json({
        success: true,
        data: transformedRecords
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
        success: false,
        message: 'Error fetching attendance records',
        error: error.message
    });
  }
};

// Get detailed attendance record
exports.getAttendanceRecordDetails = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('records.student', 'rollNumber name');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Transform the records to include student details
    const transformedRecord = {
      ...record.toObject(),
      records: record.records.map(r => ({
        studentId: r.student._id,
        rollNumber: r.student.rollNumber,
        name: r.student.name,
        status: r.status,
        timestamp: r.timestamp
      }))
    };

    res.json({
      success: true,
      data: transformedRecord
    });
  } catch (error) {
    console.error('Error getting attendance record details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance record details'
    });
  }
};

// Dashboard stats endpoint
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, classList, recentAttendance] = await Promise.all([
      Student.countDocuments(),
      Student.distinct('class'),
      Attendance.find().sort({ date: -1 }).limit(5).populate('records.student', 'name rollNumber')
    ]);

    // Calculate today's attendance rate
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);
    const todaysAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });
    let present = 0, total = 0;
    todaysAttendance.forEach(session => {
      session.records.forEach(r => {
        total++;
        if (r.status === 'present') present++;
      });
    });
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    // Format recent attendance for frontend
    const recent = recentAttendance.map(a => ({
      _id: a._id,
      className: a.class,
      section: a.section || '',
      date: a.date,
      timeAgo: a.date ? a.date.toLocaleDateString() : '',
      presentCount: a.records.filter(r => r.status === 'present').length,
      totalStudents: a.records.length,
      subject: a.subject
    }));

    res.json({
      attendanceRate,
      totalStudents,
      totalClasses: classList.length,
      recent
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

// Get recent attendance sessions (for dashboard)
exports.getRecentSessions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent attendance sessions
    const recentSessions = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('records.student', 'name rollNumber class');

    res.json(recentSessions);
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await AttendanceSession.find()
      .sort({ createdAt: -1 })
      .populate('records.student', 'name rollNumber department section');

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records with new filters (department, section, subject, date)
exports.getRecords = async (req, res) => {
  try {
    const { date, department, section, subjectCode } = req.query;

    if (!date || !department || !section || !subjectCode) {
      return res.status(400).json({
        success: false,
        message: 'Date, department, section, and subject code are required'
      });
    }

    // Parse the input date and create start/end dates for the day
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Create start and end dates for the day (midnight to midnight)
    const startDate = new Date(searchDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(searchDate);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log('Searching for attendance records:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      department,
      section,
      subjectCode
    });

    // Search with date range and other criteria
    const attendanceRecords = await AttendanceSession.find({
      date: { $gte: startDate, $lte: endDate },
      department,
      section,
      subjectCode
    }).populate('records.student', 'name rollNumber barcodeId');

    console.log('Found matching records:', attendanceRecords.length);

    // Transform the records to a flat structure for easier display
    const flatRecords = [];
    attendanceRecords.forEach(session => {
      session.records.forEach(record => {
        flatRecords.push({
          studentName: record.student.name,
          rollNumber: record.student.rollNumber,
          barcodeId: record.student.barcodeId,
          status: record.status,
          date: session.date,
          subject: session.subjectCode,
          department: session.department,
          section: session.section,
          teacher: session.teacher,
          timestamp: record.timestamp
        });
      });
    });

    res.json(flatRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
};

// Get subject-wise attendance (all students for one subject)
exports.getSubjectWiseAttendance = async (req, res) => {
  try {
    const { department, section, subjectCode } = req.query;

    if (!department || !section || !subjectCode) {
      return res.status(400).json({
        success: false,
        message: 'Department, section, and subject code are required'
      });
    }

    // Get all students in the department and section
    const students = await Student.find({ department, section });

    // Get all attendance sessions for this subject
    const attendanceSessions = await AttendanceSession.find({
      department,
      section,
      subjectCode
    }).populate('records.student', 'name rollNumber barcodeId');

    // Calculate attendance for each student
    const studentAttendance = students.map(student => {
      let totalClasses = 0;
      let classesAttended = 0;

      attendanceSessions.forEach(session => {
        const studentRecord = session.records.find(record =>
          record.student._id.toString() === student._id.toString()
        );

        if (studentRecord) {
          totalClasses++;
          if (studentRecord.status === 'present') {
            classesAttended++;
          }
        }
      });

      const percentage = totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 100) : 0;

      return {
        studentName: student.name,
        rollNumber: student.rollNumber,
        barcodeId: student.barcodeId,
        classesAttended,
        totalClasses,
        percentage
      };
    });

    // Sort by percentage (descending)
    studentAttendance.sort((a, b) => b.percentage - a.percentage);

    res.json(studentAttendance);
  } catch (error) {
    console.error('Error fetching subject-wise attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subject-wise attendance',
      error: error.message
    });
  }
};

// Get student-wise attendance (one student, all subjects)
exports.getStudentWiseAttendance = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all attendance sessions for this student
    const attendanceSessions = await AttendanceSession.find({
      department: student.department,
      section: student.section,
      'records.student': studentId
    });

    // Group by subject
    const subjectMap = new Map();

    attendanceSessions.forEach(session => {
      const studentRecord = session.records.find(record =>
        record.student.toString() === studentId
      );

      if (studentRecord) {
        if (!subjectMap.has(session.subjectCode)) {
          subjectMap.set(session.subjectCode, {
            subjectCode: session.subjectCode,
            subjectName: session.subjectCode, // You might want to get this from Course model
            totalClasses: 0,
            classesAttended: 0
          });
        }

        const subject = subjectMap.get(session.subjectCode);
        subject.totalClasses++;
        if (studentRecord.status === 'present') {
          subject.classesAttended++;
        }
      }
    });

    // Calculate percentages
    const subjects = Array.from(subjectMap.values()).map(subject => ({
      ...subject,
      percentage: subject.totalClasses > 0 ? Math.round((subject.classesAttended / subject.totalClasses) * 100) : 0
    }));

    // Calculate overall percentage
    const totalClasses = subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.classesAttended, 0);
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    res.json({
      studentName: student.name,
      rollNumber: student.rollNumber,
      barcodeId: student.barcodeId,
      department: student.department,
      section: student.section,
      overallPercentage,
      subjects: subjects.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode))
    });
  } catch (error) {
    console.error('Error fetching student-wise attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student-wise attendance',
      error: error.message
    });
  }
};

// Get class overview (all subjects for a class)
exports.getClassOverview = async (req, res) => {
  try {
    const { department, section } = req.query;

    if (!department || !section) {
      return res.status(400).json({
        success: false,
        message: 'Department and section are required'
      });
    }

    // Get all students in the class
    const students = await Student.find({ department, section });
    const totalStudents = students.length;

    // Get all attendance sessions for this class
    const attendanceSessions = await AttendanceSession.find({
      department,
      section
    });

    // Group by subject
    const subjectMap = new Map();

    attendanceSessions.forEach(session => {
      if (!subjectMap.has(session.subjectCode)) {
        subjectMap.set(session.subjectCode, {
          subjectCode: session.subjectCode,
          subjectName: session.subjectCode,
          sessions: [],
          studentAttendance: new Map()
        });
      }

      const subject = subjectMap.get(session.subjectCode);
      subject.sessions.push(session);

      // Track each student's attendance for this subject
      session.records.forEach(record => {
        const studentId = record.student.toString();
        if (!subject.studentAttendance.has(studentId)) {
          subject.studentAttendance.set(studentId, { total: 0, present: 0 });
        }
        const studentData = subject.studentAttendance.get(studentId);
        studentData.total++;
        if (record.status === 'present') {
          studentData.present++;
        }
      });
    });

    // Calculate statistics for each subject
    const subjectOverview = Array.from(subjectMap.values()).map(subject => {
      const studentPercentages = Array.from(subject.studentAttendance.values()).map(data =>
        data.total > 0 ? (data.present / data.total) * 100 : 0
      );

      const averageAttendance = studentPercentages.length > 0
        ? Math.round(studentPercentages.reduce((sum, p) => sum + p, 0) / studentPercentages.length)
        : 0;

      const studentsAbove75 = studentPercentages.filter(p => p >= 75).length;
      const studentsBelow75 = studentPercentages.filter(p => p < 75).length;

      return {
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        totalStudents,
        averageAttendance,
        studentsAbove75,
        studentsBelow75,
        totalSessions: subject.sessions.length
      };
    });

    res.json(subjectOverview.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode)));
  } catch (error) {
    console.error('Error fetching class overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class overview',
      error: error.message
    });
  }
};
