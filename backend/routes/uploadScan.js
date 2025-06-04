const express = require('express');
const router = express.Router();
const uploadScanController = require('../controllers/uploadScanController');

router.post('/', uploadScanController.uploadScan);

module.exports = router;
