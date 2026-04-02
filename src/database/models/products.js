'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    static associate(models) {
      Products.belongsTo(models.Categories, { foreignKey: 'categoryId' });
      Products.hasMany(models.OrdersItems, { foreignKey: 'productId' });
      Products.belongsToMany(models.Ingredients, {
        through: models.ProductsIngredients,
        foreignKey: 'productId',
        otherKey: 'ingredientId',
      });
      Products.hasMany(models.ProductsIngredients, { foreignKey: 'productId' });
    }
  }
  Products.init(
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      avaliable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        field: 'category_id',
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'products',
      modelName: 'Products',
    },
  );
  return Products;
};
