const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

router.get('/', cmsController.getAllContent);
router.get('/:key', cmsController.getContentByKey);
router.put('/:key', cmsController.saveContent);

module.exports = router;
