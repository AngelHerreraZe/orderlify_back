const { Router } = require('express');
const ingredientsController = require('../controllers/ingredients.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

// CRUD global de ingredientes (catálogo)
router
  .route('/ingredients')
  .get(ingredientsController.getAll)
  .post(
    authenticate,
    allowRoles('Admin', 'Manager'),
    ingredientsController.create
  );

router.delete(
  '/ingredients/:id',
  authenticate,
  allowRoles('Admin', 'Manager'),
  ingredientsController.delete
);

// Ingredientes por producto
router.get('/products/:productId/ingredients', ingredientsController.getByProduct);

router.put(
  '/products/:productId/ingredients',
  authenticate,
  allowRoles('Admin', 'Manager'),
  ingredientsController.syncProductIngredients
);

module.exports = router;
