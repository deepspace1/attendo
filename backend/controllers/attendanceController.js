const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Create new attendance session
exports.createAttendanceSession = async (req, res) => {
    try {
        const { class: className, subject, teacher, records, date } = req.body;

        // Check if records were provided from the frontend
        let attendanceRecords;

        if (records && Array.isArray(records)) {
            // Use the records provided by the frontend
            console.log('Using attendance records from frontend:', records.length);
            attendanceRecords = records;
        } else {
            // Fallback: Get all students in the class and mark them absent
            console.log('No records provided, creating default records');
            const students = await Student.find({ class: className });
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

        const attendance = new Attendance({
            date: attendanceDate,
            class: className,
            subject,
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
