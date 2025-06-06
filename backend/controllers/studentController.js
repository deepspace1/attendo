const Student = require('../database-models/Student');

// Get all students with filtering by department and section
exports.getAllStudents = async (req, res) => {
    try {
        const { department, section } = req.query;
        let query = {};

        // Filter by department if provided
        if (department) {
            query.department = { $regex: new RegExp(`^${department}$`, 'i') };
        }

        // Filter by section if provided
        if (section) {
            query.section = { $regex: new RegExp(`^${section}$`, 'i') };
        }

        console.log('Searching with query:', query);

        // First check if we can connect to the database
        const count = await Student.countDocuments();
        console.log('Total students in database:', count);

        // Then get the filtered results
        const students = await Student.find(query).sort({ rollNumber: 1 });
        console.log('Found students for query:', students.length);
        console.log('First student (if any):', students[0]);

        res.json(students);
    } catch (error) {
        console.error('Error in getAllStudents:', error);
        res.status(500).json({
            message: error.message,
            error: error.stack
        });
    }
};

// Get students by class
exports.getStudentsByClass = async (req, res) => {
    try {
        const students = await Student.find({ class: req.params.class });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Legacy add student function - removed (using new one below)

// Find student by barcode (case-insensitive) - matches barcodeId field which contains 22***** format
exports.findByBarcode = async (req, res) => {
    try {
        console.log('Searching for barcode:', req.params.barcodeId);

        // First try to find by barcodeId (which contains the 22***** format)
        const student = await Student.findOne({
            barcodeId: { $regex: new RegExp(`^${req.params.barcodeId}$`, 'i') }
        });

        if (student) {
            console.log('Found student by barcodeId:', student.name);
            res.json(student);
            return;
        }

        console.log('Student not found for barcode:', req.params.barcodeId);
        res.status(404).json({ message: 'Student not found' });
    } catch (error) {
        console.error('Error in findByBarcode:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all unique departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Student.distinct('department');
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all unique sections for a department
exports.getSections = async (req, res) => {
    try {
        const { department } = req.query;
        let query = {};
        if (department) {
            query.department = department;
        }
        const sections = await Student.distinct('section', query);
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new student (alias for addStudent)
exports.addStudent = async (req, res) => {
    try {
        const studentData = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [
                { rollNumber: studentData.rollNumber },
                { barcodeId: studentData.barcodeId }
            ]
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student with this USN or Barcode ID already exists'
            });
        }

        const student = new Student(studentData);
        const savedStudent = await student.save();

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student: savedStudent
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    }
};