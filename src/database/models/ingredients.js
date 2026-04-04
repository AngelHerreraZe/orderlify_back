'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ingredients extends Model {
    static associate(models) {
      Ingredients.belongsToMany(models.Products, {
        through: 'products_ingredients',
        foreignKey: 'ingredient_id',
        otherKey: 'product_id',
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
    },
    {
      sequelize,
      tableName: 'ingredients',
      modelName: 'Ingredients',
    }
  );

  return Ingredients;
};
