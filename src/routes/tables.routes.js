const { Router } = require('express');
const tablesController = require('../controllers/tables.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router
  .route('/tables')
  .post(
    authenticate,
    allowRoles('Admin', 'Manager'),
    tablesController.createTable
  )
  .get(
    authenticate,
    allowRoles('Waiter', 'Manager', 'Admin', 'Cashier'),
    tablesController.getTables
  );

router
  .route('/tables/:id')
  .put(authenticate, allowRoles('Admin', 'Manager'), tablesController.updateTable)
  .delete(authenticate, allowRoles('Admin', 'Manager'), tablesController.deleteTable);

// Regenerar QR manualmente
router.post(
  '/tables/:id/regenerate-qr',
  authenticate,
  allowRoles('Admin', 'Manager'),
  tablesController.regenerateQR,
);

module.exports = router;
