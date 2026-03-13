const catchAsync = require('../utils/catchAsync');
const productsServices = require('../services/products.services');

exports.createProduct = catchAsync(async (req, res) => {
  const { name, description, price, categoryId } = req.body;
  await productsServices.createProduct(name, description, price, categoryId);
  return res.sendStatus(200);
});

exports.getProducts = catchAsync(async (req, res) => {
  const products = await productsServices.getProducts();
  return res.json({ products });
});

exports.getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await productsServices.getProductById(id);
  return res.json({ product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, available, categoryId } = req.body;
  await productsServices.updateProduct(id, name, description, price, available, categoryId);
  return res.sendStatus(204);
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  await productsServices.deleteProduct(id);
  return res.sendStatus(204);
});

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await productsServices.getCategories();
  return res.json({ categories });
});

exports.createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  await productsServices.createCategory(name);
  return res.sendStatus(200);
});
