const Student = require('../models/Student');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const { class: className } = req.query;
        let query = {};
        
        // If class is provided, filter by class
        if (className) {
            // Use case-insensitive regex match for class
            query = { class: { $regex: new RegExp(`^${className}$`, 'i') } };
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

// Add new student
exports.addStudent = async (req, res) => {
    const student = new Student({
        rollNumber: req.body.rollNumber,
        name: req.body.name,
        class: req.body.class,
        barcodeId: req.body.barcodeId
    });

    try {
        const newStudent = await student.save();
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Find student by barcode (case-insensitive)
exports.findByBarcode = async (req, res) => {
    try {
        const student = await Student.findOne({
            barcodeId: { $regex: new RegExp(`^${req.params.barcodeId}$`, 'i') }
        });
        if (student) {
            res.json(student);
            return;
        }
        // If not found by barcodeId, try by rollNumber (case-insensitive)
        const studentByRoll = await Student.findOne({
            rollNumber: { $regex: new RegExp(`^${req.params.barcodeId}$`, 'i') }
        });
        if (studentByRoll) {
            res.json(studentByRoll);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};