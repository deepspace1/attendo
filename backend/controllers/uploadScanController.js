const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('file');

// Stub function to decode barcode/QR code from image
async function decodeScanCode(filePath) {
  // TODO: Implement actual decoding logic using a library like 'jsqr' or 'qrcode-reader'
  // For now, return a dummy scan code
  return 'dummy-scan-code';
}

exports.uploadScan = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ message: 'File upload error', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const scanCode = await decodeScanCode(req.file.path);

      // Delete the uploaded file after processing
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      });

      // Respond with the decoded scan code
      res.json({ message: 'Scan code decoded successfully', scanCode });
    } catch (error) {
      res.status(500).json({ message: 'Error decoding scan code', error: error.message });
    }
  });
};
