const { Router } = require('express');
const ordersController = require('../controllers/orders.controller');

const router = Router();

router
  .route('/orders')
  .post(ordersController.createOrder)
  .get(ordersController.getOrders);

router
  .route('/orders/:id')
  .get(ordersController.getOrderById)
  .put(ordersController.updateOrder)
  .delete(ordersController.deleteOrder);

module.exports = router;
