const { Router } = require('express');
const productsController = require('../controllers/products.controller');

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
