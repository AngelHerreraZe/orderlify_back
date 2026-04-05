'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BranchProducts extends Model {
    static associate(models) {
      BranchProducts.belongsTo(models.Branch,   { foreignKey: 'branchId' });
      BranchProducts.belongsTo(models.Products, { foreignKey: 'productId' });
    }
  }

  BranchProducts.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      branchId: {
        type: DataTypes.INTEGER,
        field: 'branch_id',
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        field: 'product_id',
        allowNull: false,
      },
      // Branch-specific price override; null = use base product price
      price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'branch_products',
      modelName: 'BranchProducts',
    }
  );

  return BranchProducts;
};
