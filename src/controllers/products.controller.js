'use strict';
const catchAsync      = require('../utils/catchAsync');
const productsServices = require('../services/products.services');

exports.createProduct = catchAsync(async (req, res) => {
  const { name, description, price, cost, categoryId } = req.body;
  const companyId = req.tenant?.companyId ?? null;
  const product = await productsServices.createProduct(name, description, price, cost ?? null, categoryId, companyId);
  return res.status(201).json({ product });
});

exports.getProducts = catchAsync(async (req, res) => {
  const since = req.query.since ?? null;
  const products = await productsServices.getProducts(req.tenant, since);
  return res.json({ products });
});

exports.getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await productsServices.getProductById(id);
  return res.json({ product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, cost, available, categoryId } = req.body;
  await productsServices.updateProduct(id, name, description, price, cost ?? null, available, categoryId);
  return res.sendStatus(204);
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  await productsServices.deleteProduct(id);
  return res.sendStatus(204);
});

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await productsServices.getCategories(req.tenant);
  return res.json({ categories });
});

exports.createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  const companyId = req.tenant?.companyId ?? null;
  await productsServices.createCategory(name, companyId);
  return res.sendStatus(200);
});
