const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/razorpay/order', paymentController.createRazorpayOrder);
router.post('/razorpay/link', paymentController.createRazorpayPaymentLink);
router.post('/order', paymentController.createRazorpayOrder);
router.post('/link', paymentController.createRazorpayPaymentLink);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;
