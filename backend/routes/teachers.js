const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Get all teachers
router.get('/', teacherController.getAllTeachers);

// Create new teacher
router.post('/', teacherController.createTeacher);

// Get teachers by department
router.get('/department', teacherController.getTeachersByDepartment);

// Get teacher by ID
router.get('/:id', teacherController.getTeacherById);

module.exports = router;
