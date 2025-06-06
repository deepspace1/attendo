const Department = require('../database-models/Department');

// Get all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .select('name code description sections')
            .sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        console.error('Error in getAllDepartments:', error);
        res.status(500).json({
            message: error.message,
            error: error.stack
        });
    }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new department
exports.createDepartment = async (req, res) => {
    try {
        const departmentData = req.body;

        // Check if department already exists
        const existingDepartment = await Department.findOne({
            $or: [
                { name: departmentData.name },
                { code: departmentData.code }
            ]
        });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name or code already exists'
            });
        }

        // Set default sections if not provided
        if (!departmentData.sections || departmentData.sections.length === 0) {
            departmentData.sections = ['A', 'B', 'C'];
        }

        const department = new Department({
            ...departmentData,
            isActive: true
        });
        const savedDepartment = await department.save();

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            department: savedDepartment
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: error.message
        });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json({
            success: true,
            message: 'Department updated successfully',
            department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
};

// Delete department (soft delete)
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: error.message
        });
    }
};

// Add section to department
exports.addSection = async (req, res) => {
    try {
        const { departmentId, section } = req.body;

        if (!departmentId || !section) {
            return res.status(400).json({
                success: false,
                message: 'Department ID and section are required'
            });
        }

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const sectionUpper = section.toUpperCase().trim();

        // Check if section already exists
        if (department.sections.includes(sectionUpper)) {
            return res.status(400).json({
                success: false,
                message: 'Section already exists in this department'
            });
        }

        department.sections.push(sectionUpper);
        await department.save();

        res.json({
            success: true,
            message: 'Section added successfully',
            department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding section',
            error: error.message
        });
    }
};

// Remove section from department
exports.removeSection = async (req, res) => {
    try {
        const { departmentId, section } = req.body;

        if (!departmentId || !section) {
            return res.status(400).json({
                success: false,
                message: 'Department ID and section are required'
            });
        }

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const sectionUpper = section.toUpperCase().trim();
        department.sections = department.sections.filter(s => s !== sectionUpper);
        await department.save();

        res.json({
            success: true,
            message: 'Section removed successfully',
            department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing section',
            error: error.message
        });
    }
};

// Get sections for a department
exports.getSections = async (req, res) => {
    try {
        const { departmentName } = req.query;

        if (!departmentName) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        const department = await Department.findOne({
            name: departmentName,
            isActive: true
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.json({
            success: true,
            sections: department.sections || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sections',
            error: error.message
        });
    }
};
