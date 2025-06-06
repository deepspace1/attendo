const Student = require('../database-models/Student');

exports.receiveScanCode = async (req, res) => {
    try {
        const { scanCode } = req.body;
        if (!scanCode) {
            return res.status(400).json({
                success: false,
                message: 'scanCode is required'
            });
        }

        console.log('Received scan code:', scanCode);

        // Try to find student by barcode
        try {
            const student = await Student.findOne({ barcodeId: scanCode });

            if (student) {
                console.log('Student found:', student.name, student.rollNumber);
                res.status(200).json({
                    success: true,
                    message: 'Student found successfully',
                    student: {
                        _id: student._id,
                        name: student.name,
                        rollNumber: student.rollNumber,
                        barcodeId: student.barcodeId,
                        department: student.department,
                        section: student.section
                    },
                    scanCode
                });
            } else {
                console.log('Student not found for barcode:', scanCode);
                res.status(404).json({
                    success: false,
                    message: `Student not found for barcode: ${scanCode}`,
                    scanCode
                });
            }
        } catch (dbError) {
            console.error('Database error while finding student:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error while searching for student',
                scanCode
            });
        }
    } catch (error) {
        console.error('Error in receiveScanCode:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
