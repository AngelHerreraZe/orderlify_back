'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    static associate(models) {
      Products.belongsTo(models.Categories,    { foreignKey: 'categoryId' });
      Products.belongsTo(models.Company,       { foreignKey: 'companyId', as: 'company' });
      Products.hasMany(models.OrdersItems,     { foreignKey: 'productId' });
      Products.hasMany(models.BranchProducts,  { foreignKey: 'productId', as: 'branchProductLinks' });
      Products.belongsToMany(models.Branch, {
        through: models.BranchProducts,
        foreignKey: 'productId',
        otherKey: 'branchId',
        as: 'branches',
      });
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
      cost: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null,
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
      companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'products',
      modelName: 'Products',
    }
  );

  return Products;
};
