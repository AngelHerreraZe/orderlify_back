const catchAsync = require('../utils/catchAsync');
const productsServices = require('../services/products.services');

exports.createProduct = catchAsync(async (req, res, next) => {
  try {
    const { name, description, price, categoryId } = req.body;
    await productsServices.createProduct(name, description, price, categoryId);
    return res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});

exports.getProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await productsServices.getProducts();
    return res.json({ products });
  } catch (error) {
    throw error;
  }
});

exports.getProductById = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productsServices.getProductById(id);
    return res.json({ product });
  } catch (error) {
    throw error;
  }
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, avaliable, categoryId } = req.body;
    await productsServices.updateProduct(
      id,
      name,
      description,
      price,
      avaliable,
      categoryId
    );
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    await productsServices.deleteProduct(id);
    return res.sendStatus(204);
  } catch (error) {
    throw error;
  }
});

exports.getCategories = catchAsync(async (req, res, next) => {
  try {
    const categories = await productsServices.getCategories();
    return res.json({ categories });
  } catch (error) {
    throw error;
  }
});

exports.createCategory = catchAsync(async (req, res, next) => {
  try {
    const { name } = req.body;
    await productsServices.createCategory(name);
    return res.sendStatus(200);
  } catch (error) {
    throw error;
  }
});
