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
    allowRoles('Waiter', 'Manager', 'Admin'),
    tablesController.getTables
  );

router
  .route('/tables/:id')
  .put(tablesController.updateTable)
  .delete(tablesController.deleteTable);

module.exports = router;