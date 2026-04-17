const { Router } = require('express');
const paymentsController = require('../controllers/payments.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router
  .route('/payments')
  .post(authenticate, allowRoles('Admin', 'Manager', 'Cashier'), paymentsController.registerPayment)
  .get(authenticate, allowRoles('Admin', 'Manager', 'Cashier'), paymentsController.getAllPayments);

router.get('/payments/:id', authenticate, allowRoles('Admin', 'Manager', 'Cashier'), paymentsController.getOnePayment);

module.exports = router;
