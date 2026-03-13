const { Router } = require('express');
const paymentsController = require('../controllers/payments.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router
  .route('/payments')
  .post(paymentsController.registerPayment)
  .get(paymentsController.getAllPayments);

router.get('/payments/:id', paymentsController.getOnePayment);

module.exports = router;
