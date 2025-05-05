const { Router } = require('express');
const paymentsController = require('../controllers/payments.controller');

const router = Router();

router
    .route('/payments')
    .post(paymentsController.registerPayment)

module.exports = router;