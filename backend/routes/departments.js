const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Get all departments
router.get('/', departmentController.getAllDepartments);

// Create new department
router.post('/', departmentController.createDepartment);

// Section management (MUST come before /:id routes)
router.post('/sections/add', departmentController.addSection);
router.post('/sections/remove', departmentController.removeSection);
router.get('/sections', departmentController.getSections);

// Get department by ID (MUST come after specific routes)
router.get('/:id', departmentController.getDepartmentById);

// Update department
router.put('/:id', departmentController.updateDepartment);

// Delete department
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
