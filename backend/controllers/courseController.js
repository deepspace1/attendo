const Course = require('../database-models/Course');

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('teacherId', 'name email')
            .sort({ courseCode: 1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get courses by department and semester
exports.getCoursesByDepartment = async (req, res) => {
    try {
        const { department, semester } = req.query;
        let query = {};
        
        if (department) {
            query.department = department;
        }
        if (semester) {
            query.semester = parseInt(semester);
        }
        
        const courses = await Course.find(query)
            .populate('teacherId', 'name email')
            .sort({ courseCode: 1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get course by course code
exports.getCourseByCode = async (req, res) => {
    try {
        const course = await Course.findOne({ courseCode: req.params.courseCode })
            .populate('teacherId', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all unique subject codes
exports.getSubjectCodes = async (req, res) => {
    try {
        const { department, semester } = req.query;
        let query = {};
        
        if (department) {
            query.department = department;
        }
        if (semester) {
            query.semester = parseInt(semester);
        }
        
        const courses = await Course.find(query, 'courseCode courseName').sort({ courseCode: 1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new course
exports.createCourse = async (req, res) => {
    try {
        const courseData = req.body;

        // Check if course already exists
        const existingCourse = await Course.findOne({
            courseCode: courseData.courseCode
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course with this code already exists'
            });
        }

        const course = new Course(courseData);
        const savedCourse = await course.save();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course: savedCourse
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
};
