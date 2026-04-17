const { Router } = require('express');
const ordersController = require('../controllers/orders.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router
  .route('/orders')
  .post(
    authenticate,
    allowRoles('Waiter', 'Cashier'),
    ordersController.createOrder
  )
  .get(ordersController.getOrders);

router
  .route('/orders/:id')
  .get(ordersController.getOrderById)
  .put(
    authenticate,
    allowRoles('Waiter', 'Chef', 'Manager'),
    ordersController.updateOrder
  )
  .delete(
    authenticate,
    allowRoles('Manager', 'Admin'),
    ordersController.deleteOrder
  );

// Actualización de estado por comando de voz (solo Chef)
router.patch(
  '/orders/:id/voice-status',
  authenticate,
  allowRoles('Chef'),
  ordersController.voiceUpdateStatus,
);

router.post('/orders/:orderId/items', ordersController.addItemsToOrder);

router
  .route('/orders/:orderId/items/:productId')
  .put(ordersController.editOrderItems)
  .delete(ordersController.deleteOrderItem);

module.exports = router;
