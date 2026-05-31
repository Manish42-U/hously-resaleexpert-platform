const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/summary', adminController.getSummary);
router.get('/counts', adminController.getCounts);
router.get('/workspace', adminController.getWorkspace);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
