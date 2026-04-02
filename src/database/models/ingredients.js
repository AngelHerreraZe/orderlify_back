'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ingredients extends Model {
    static associate(models) {
      Ingredients.belongsToMany(models.Products, {
        through: models.ProductsIngredients,
        foreignKey: 'ingredientId',
        otherKey: 'productId',
      });
    }
  }

  Ingredients.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stock: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'ingredients',
      modelName: 'Ingredients',
    }
  );

  return Ingredients;
};