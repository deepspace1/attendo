const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

// POST route to receive scan code from mobile device
router.post('/', scanController.receiveScanCode);

module.exports = router;
