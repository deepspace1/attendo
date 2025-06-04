const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Handle barcode scan
router.post('/scan', async (req, res) => {
  try {
    const { scanCode } = req.body;
    
    if (!scanCode) {
      return res.status(400).json({
        success: false,
        message: 'No scan code provided'
      });
    }

    console.log('Received barcode scan:', scanCode);

    // Try to find student by barcode ID
    let student = await Student.findOne({ barcodeId: scanCode });
    
    if (!student) {
      // Try to find by roll number as fallback
      student = await Student.findOne({ rollNumber: scanCode });
    }

    if (student) {
      res.json({
        success: true,
        message: `Student found: ${student.name}`,
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          class: student.class,
          barcodeId: student.barcodeId
        }
      });
    } else {
      res.json({
        success: false,
        message: `No student found with barcode/roll number: ${scanCode}`,
        scanCode: scanCode
      });
    }
  } catch (error) {
    console.error('Error processing barcode scan:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing barcode scan',
      error: error.message
    });
  }
});

// Get all students with barcodes
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({}, 'name rollNumber class barcodeId');
    res.json({
      success: true,
      students: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// Update student barcode ID
router.put('/student/:id/barcode', async (req, res) => {
  try {
    const { id } = req.params;
    const { barcodeId } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { barcodeId: barcodeId },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Barcode ID updated successfully',
      student: student
    });
  } catch (error) {
    console.error('Error updating barcode ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating barcode ID',
      error: error.message
    });
  }
});

module.exports = router;
