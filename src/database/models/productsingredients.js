'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductsIngredients extends Model {
    static associate(models) {
      ProductsIngredients.belongsTo(models.Products,    { foreignKey: 'productId' });
      ProductsIngredients.belongsTo(models.Ingredients, { foreignKey: 'ingredientId' });
    }
  }

  ProductsIngredients.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      productId: {
        type: DataTypes.INTEGER,
        field: 'product_id',
        allowNull: false,
      },
      ingredientId: {
        type: DataTypes.INTEGER,
        field: 'ingredient_id',
        allowNull: false,
      },
      quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      overrideQuantity: {
        type: DataTypes.FLOAT,
        field: 'override_quantity',
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      tableName: 'products_ingredients',
      modelName: 'ProductsIngredients',
    }
  );

  return ProductsIngredients;
};