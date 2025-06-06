const Teacher = require('../database-models/Teacher');

// Get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ isActive: true })
            .select('name email department')
            .sort({ name: 1 });
        res.json(teachers);
    } catch (error) {
        console.error('Error in getAllTeachers:', error);
        res.status(500).json({ 
            message: error.message,
            error: error.stack
        });
    }
};

// Get teacher by ID
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get teachers by department
exports.getTeachersByDepartment = async (req, res) => {
    try {
        const { department } = req.query;
        let query = { isActive: true };
        
        if (department) {
            query.department = department;
        }
        
        const teachers = await Teacher.find(query)
            .select('name email department')
            .sort({ name: 1 });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new teacher
exports.createTeacher = async (req, res) => {
    try {
        const teacherData = req.body;

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({
            email: teacherData.email
        });

        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: 'Teacher with this email already exists'
            });
        }

        const teacher = new Teacher(teacherData);
        const savedTeacher = await teacher.save();

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            teacher: savedTeacher
        });
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating teacher',
            error: error.message
        });
    }
};
