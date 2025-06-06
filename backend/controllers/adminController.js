const Student = require('../database-models/Student');
const Teacher = require('../database-models/Teacher');
const Course = require('../database-models/Course');
const AttendanceSession = require('../database-models/AttendanceSession');
const Department = require('../database-models/Department');

// Get comprehensive admin dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        // Fetch all data in parallel
        const [students, teachers, courses, attendanceSessions, departments] = await Promise.all([
            Student.find().sort({ createdAt: -1 }),
            Teacher.find().sort({ createdAt: -1 }),
            Course.find().sort({ createdAt: -1 }),
            AttendanceSession.find().sort({ createdAt: -1 }),
            Department.find({ isActive: true }).sort({ name: 1 })
        ]);

        // Calculate statistics
        const stats = {
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalCourses: courses.length,
            totalDepartments: departments.length,
            totalAttendanceSessions: attendanceSessions.length,
            activeStudents: students.filter(s => s.isActive !== false).length,
            activeTeachers: teachers.filter(t => t.isActive !== false).length,
            activeCourses: courses.filter(c => c.isActive !== false).length
        };

        // Department-wise breakdown
        const departmentStats = departments.map(dept => {
            const deptStudents = students.filter(s => s.department === dept.name);
            const deptTeachers = teachers.filter(t => t.department === dept.name);
            const deptCourses = courses.filter(c => c.department === dept.name);

            return {
                _id: dept._id,
                name: dept.name,
                code: dept.code,
                description: dept.description,
                students: deptStudents.length,
                teachers: deptTeachers.length,
                courses: deptCourses.length,
                sections: dept.sections || [],
                activeSections: [...new Set(deptStudents.map(s => s.section).filter(Boolean))]
            };
        });

        // Recent data (last 20 records)
        const recentData = {
            students: students.slice(0, 20).map(s => ({
                _id: s._id,
                name: s.name,
                rollNumber: s.rollNumber,
                barcodeId: s.barcodeId,
                department: s.department,
                section: s.section,
                semester: s.semester,
                isActive: s.isActive,
                createdAt: s.createdAt
            })),
            teachers: teachers.slice(0, 20).map(t => ({
                _id: t._id,
                name: t.name,
                email: t.email,
                department: t.department,
                designation: t.designation,
                isActive: t.isActive,
                createdAt: t.createdAt
            })),
            courses: courses.slice(0, 20).map(c => ({
                _id: c._id,
                courseCode: c.courseCode,
                courseName: c.courseName,
                department: c.department,
                semester: c.semester,
                credits: c.credits,
                isActive: c.isActive,
                createdAt: c.createdAt
            })),
            attendanceSessions: attendanceSessions.slice(0, 10).map(a => ({
                _id: a._id,
                department: a.department,
                section: a.section,
                subjectCode: a.subjectCode,
                teacher: a.teacher,
                date: a.date,
                totalStudents: a.records.length,
                presentStudents: a.records.filter(r => r.status === 'present').length,
                createdAt: a.createdAt
            }))
        };

        res.json({
            success: true,
            stats,
            departmentStats,
            recentData,
            departments
        });

    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

// Get all students with full details
exports.getAllStudentsDetailed = async (req, res) => {
    try {
        const { department, section, page = 1, limit = 50 } = req.query;
        
        let query = {};
        if (department) query.department = department;
        if (section) query.section = section;

        const skip = (page - 1) * limit;
        
        const students = await Student.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Student.countDocuments(query);

        res.json({
            success: true,
            students,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// Get all teachers with full details
exports.getAllTeachersDetailed = async (req, res) => {
    try {
        const { department, page = 1, limit = 50 } = req.query;
        
        let query = {};
        if (department) query.department = department;

        const skip = (page - 1) * limit;
        
        const teachers = await Teacher.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Teacher.countDocuments(query);

        res.json({
            success: true,
            teachers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching teachers',
            error: error.message
        });
    }
};

// Get all courses with full details
exports.getAllCoursesDetailed = async (req, res) => {
    try {
        const { department, semester, page = 1, limit = 50 } = req.query;
        
        let query = {};
        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);

        const skip = (page - 1) * limit;
        
        const courses = await Course.find(query)
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(query);

        res.json({
            success: true,
            courses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
};

// Get attendance sessions with details
exports.getAttendanceSessionsDetailed = async (req, res) => {
    try {
        const { department, section, subjectCode, page = 1, limit = 20 } = req.query;
        
        let query = {};
        if (department) query.department = department;
        if (section) query.section = section;
        if (subjectCode) query.subjectCode = subjectCode;

        const skip = (page - 1) * limit;
        
        const sessions = await AttendanceSession.find(query)
            .populate('records.student', 'name rollNumber barcodeId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AttendanceSession.countDocuments(query);

        const formattedSessions = sessions.map(session => ({
            _id: session._id,
            department: session.department,
            section: session.section,
            subjectCode: session.subjectCode,
            teacher: session.teacher,
            date: session.date,
            totalStudents: session.records.length,
            presentStudents: session.records.filter(r => r.status === 'present').length,
            absentStudents: session.records.filter(r => r.status === 'absent').length,
            attendancePercentage: session.records.length > 0 
                ? Math.round((session.records.filter(r => r.status === 'present').length / session.records.length) * 100)
                : 0,
            createdAt: session.createdAt
        }));

        res.json({
            success: true,
            sessions: formattedSessions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance sessions',
            error: error.message
        });
    }
};

// Search students by name, USN, or barcode
exports.searchStudents = async (req, res) => {
    try {
        const { query, type = 'all', page = 1, limit = 20 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        let searchQuery = {};

        switch (type) {
            case 'name':
                searchQuery.name = { $regex: query, $options: 'i' };
                break;
            case 'usn':
            case 'rollNumber':
                searchQuery.rollNumber = { $regex: query, $options: 'i' };
                break;
            case 'barcode':
                searchQuery.barcodeId = { $regex: query, $options: 'i' };
                break;
            default:
                // Search in all fields
                searchQuery = {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { rollNumber: { $regex: query, $options: 'i' } },
                        { barcodeId: { $regex: query, $options: 'i' } }
                    ]
                };
        }

        const skip = (page - 1) * limit;

        const students = await Student.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Student.countDocuments(searchQuery);

        res.json({
            success: true,
            students,
            searchQuery: query,
            searchType: type,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching students',
            error: error.message
        });
    }
};

// Get attendance by student (name, USN, or barcode)
exports.getAttendanceByStudent = async (req, res) => {
    try {
        const { query, type = 'all' } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // First find the student
        let studentQuery = {};
        switch (type) {
            case 'name':
                studentQuery.name = { $regex: query, $options: 'i' };
                break;
            case 'usn':
            case 'rollNumber':
                studentQuery.rollNumber = { $regex: query, $options: 'i' };
                break;
            case 'barcode':
                studentQuery.barcodeId = { $regex: query, $options: 'i' };
                break;
            default:
                studentQuery = {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { rollNumber: { $regex: query, $options: 'i' } },
                        { barcodeId: { $regex: query, $options: 'i' } }
                    ]
                };
        }

        const students = await Student.find(studentQuery);

        if (students.length === 0) {
            return res.json({
                success: true,
                message: 'No students found',
                students: [],
                attendanceData: []
            });
        }

        // Get attendance for found students
        const studentIds = students.map(s => s._id);
        const attendanceSessions = await AttendanceSession.find({
            'records.student': { $in: studentIds }
        }).populate('records.student', 'name rollNumber barcodeId department section');

        // Format attendance data
        const attendanceData = students.map(student => {
            console.log(`Processing attendance for student: ${student.name} (${student._id})`);

            // Get all sessions for this student's department and section
            const relevantSessions = attendanceSessions.filter(session =>
                session.department === student.department &&
                session.section === student.section
            );

            console.log(`Found ${relevantSessions.length} relevant sessions for ${student.name}`);

            const subjectWiseAttendance = {};

            // Process each session
            relevantSessions.forEach(session => {
                // Find this student's record in the session
                const studentRecord = session.records.find(record =>
                    record.student && record.student._id.toString() === student._id.toString()
                );

                // Initialize subject if not exists
                if (!subjectWiseAttendance[session.subjectCode]) {
                    subjectWiseAttendance[session.subjectCode] = {
                        subjectCode: session.subjectCode,
                        totalClasses: 0,
                        presentClasses: 0,
                        absentClasses: 0,
                        sessions: []
                    };
                }

                // Count this class
                subjectWiseAttendance[session.subjectCode].totalClasses++;

                if (studentRecord) {
                    // Student was marked in this session
                    if (studentRecord.status === 'present') {
                        subjectWiseAttendance[session.subjectCode].presentClasses++;
                    } else {
                        subjectWiseAttendance[session.subjectCode].absentClasses++;
                    }

                    subjectWiseAttendance[session.subjectCode].sessions.push({
                        date: session.date,
                        status: studentRecord.status,
                        teacher: session.teacher,
                        sessionId: session._id
                    });
                } else {
                    // Student was not marked (considered absent)
                    subjectWiseAttendance[session.subjectCode].absentClasses++;
                    subjectWiseAttendance[session.subjectCode].sessions.push({
                        date: session.date,
                        status: 'absent',
                        teacher: session.teacher,
                        sessionId: session._id,
                        note: 'Not marked'
                    });
                }
            });

            // Calculate percentages
            const subjects = Object.values(subjectWiseAttendance).map(subject => ({
                ...subject,
                percentage: subject.totalClasses > 0
                    ? Math.round((subject.presentClasses / subject.totalClasses) * 100)
                    : 0
            }));

            const totalClasses = subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
            const totalPresent = subjects.reduce((sum, subject) => sum + subject.presentClasses, 0);
            const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

            console.log(`${student.name}: ${totalPresent}/${totalClasses} = ${overallPercentage}%`);

            // Sort subjects by code
            const sortedSubjects = [...subjects].sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

            return {
                student: {
                    _id: student._id,
                    name: student.name,
                    rollNumber: student.rollNumber,
                    barcodeId: student.barcodeId,
                    department: student.department,
                    section: student.section
                },
                overallPercentage,
                totalClasses,
                totalPresent,
                subjects: sortedSubjects
            };
        });

        res.json({
            success: true,
            students,
            attendanceData,
            searchQuery: query,
            searchType: type
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance by student',
            error: error.message
        });
    }
};

// Get attendance by subject (all students for a specific subject)
exports.getAttendanceBySubject = async (req, res) => {
    try {
        const { subjectCode, department, section } = req.query;

        if (!subjectCode) {
            return res.status(400).json({
                success: false,
                message: 'Subject code is required'
            });
        }

        // Build query
        let sessionQuery = { subjectCode };
        if (department) sessionQuery.department = department;
        if (section) sessionQuery.section = section;

        // Get all attendance sessions for this subject
        const attendanceSessions = await AttendanceSession.find(sessionQuery)
            .populate('records.student', 'name rollNumber barcodeId department section')
            .sort({ date: -1 });

        if (attendanceSessions.length === 0) {
            return res.json({
                success: true,
                message: 'No attendance sessions found for this subject',
                subjectCode,
                department,
                section,
                sessions: [],
                studentSummary: []
            });
        }

        // Note: We'll get all students from department/section instead of just those who attended

        // Also get all students from the same department/section who should be in this subject
        let allStudentsQuery = {};
        if (department) allStudentsQuery.department = department;
        if (section) allStudentsQuery.section = section;

        const allStudents = await Student.find(allStudentsQuery);

        // Create student summary
        const studentSummary = allStudents.map(student => {
            let totalClasses = 0;
            let presentClasses = 0;
            let absentClasses = 0;
            const sessionDetails = [];

            attendanceSessions.forEach(session => {
                totalClasses++;
                const studentRecord = session.records.find(record =>
                    record.student && record.student._id.toString() === student._id.toString()
                );

                if (studentRecord) {
                    if (studentRecord.status === 'present') {
                        presentClasses++;
                    } else {
                        absentClasses++;
                    }
                    sessionDetails.push({
                        date: session.date,
                        status: studentRecord.status,
                        teacher: session.teacher,
                        sessionId: session._id
                    });
                } else {
                    // Student was not marked (considered absent)
                    absentClasses++;
                    sessionDetails.push({
                        date: session.date,
                        status: 'absent',
                        teacher: session.teacher,
                        sessionId: session._id,
                        note: 'Not marked'
                    });
                }
            });

            const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

            // Sort session details by date (newest first)
            const sortedSessionDetails = [...sessionDetails].sort((a, b) => new Date(b.date) - new Date(a.date));

            return {
                student: {
                    _id: student._id,
                    name: student.name,
                    rollNumber: student.rollNumber,
                    barcodeId: student.barcodeId,
                    department: student.department,
                    section: student.section
                },
                totalClasses,
                presentClasses,
                absentClasses,
                percentage,
                sessionDetails: sortedSessionDetails
            };
        });

        // Sort by attendance percentage (descending)
        const sortedStudentSummary = [...studentSummary].sort((a, b) => b.percentage - a.percentage);

        // Format session data
        const formattedSessions = attendanceSessions.map(session => ({
            _id: session._id,
            date: session.date,
            department: session.department,
            section: session.section,
            teacher: session.teacher,
            totalStudents: session.records.length,
            presentStudents: session.records.filter(r => r.status === 'present').length,
            absentStudents: session.records.filter(r => r.status === 'absent').length,
            attendancePercentage: session.records.length > 0
                ? Math.round((session.records.filter(r => r.status === 'present').length / session.records.length) * 100)
                : 0
        }));

        res.json({
            success: true,
            subjectCode,
            department,
            section,
            totalSessions: attendanceSessions.length,
            totalStudents: allStudents.length,
            sessions: formattedSessions,
            studentSummary: sortedStudentSummary,
            classAverage: sortedStudentSummary.length > 0
                ? Math.round(sortedStudentSummary.reduce((sum, s) => sum + s.percentage, 0) / sortedStudentSummary.length)
                : 0
        });
    } catch (error) {
        console.error('Error fetching attendance by subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance by subject',
            error: error.message
        });
    }
};
