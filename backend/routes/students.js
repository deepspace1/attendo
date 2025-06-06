const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get all students
router.get('/', studentController.getAllStudents);

// Get students by class
router.get('/class/:class', studentController.getStudentsByClass);

// Add new student
router.post('/', studentController.addStudent);

// Find student by barcode
router.get('/barcode/:barcodeId', studentController.findByBarcode);

// Get all departments
router.get('/departments', studentController.getDepartments);

// Get sections for a department
router.get('/sections', studentController.getSections);

module.exports = router;