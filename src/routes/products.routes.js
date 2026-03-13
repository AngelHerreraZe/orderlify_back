const { Router } = require('express');
const productsController = require('../controllers/products.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router
  .route('/products')
  .post(productsController.createProduct)
  .get(productsController.getProducts);

router
  .route('/products/:id')
  .get(productsController.getProductById)
  .put(productsController.updateProduct)
  .delete(productsController.deleteProduct);

router
  .route('/categories')
  .get(productsController.getCategories)
  .post(productsController.createCategory);

module.exports = router;
