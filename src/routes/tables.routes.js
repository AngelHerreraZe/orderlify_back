const { Router } = require('express');
const tablesController = require('../controllers/tables.controller');

const router = Router();

router
  .route('/tables')
  .post(tablesController.createTable)
  .get(tablesController.getTables);

router
  .route('/tables/:id')
  .put(tablesController.updateTable)
  .delete(tablesController.deleteTable);

module.exports = router;
