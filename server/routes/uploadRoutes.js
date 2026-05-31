const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/image', uploadController.uploadSingle);
router.post('/images', uploadController.uploadMultiple);

module.exports = router;
