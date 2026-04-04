const catchAsync = require('../utils/catchAsync');
const IngredientsServices = require('../services/ingredients.services');

exports.getAll = catchAsync(async (req, res) => {
  const ingredients = await IngredientsServices.getAll();
  return res.json({ ingredients });
});

exports.create = catchAsync(async (req, res) => {
  const { name } = req.body;
  const ingredient = await IngredientsServices.create(name);
  return res.status(201).json({ ingredient });
});

exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;
  await IngredientsServices.delete(id);
  return res.sendStatus(204);
});

exports.syncProductIngredients = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { ingredientIds } = req.body; // number[]
  await IngredientsServices.syncProductIngredients(productId, ingredientIds ?? []);
  return res.sendStatus(200);
});

exports.getByProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const ingredients = await IngredientsServices.getByProduct(productId);
  return res.json({ ingredients });
});
