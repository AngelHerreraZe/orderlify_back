'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    static associate(models) {
      Branch.belongsTo(models.Company,       { foreignKey: 'companyId', as: 'company' });
      Branch.hasMany(models.Station,         { foreignKey: 'branchId',  as: 'stations' });
      Branch.hasMany(models.Tables,          { foreignKey: 'branchId' });
      Branch.hasMany(models.Orders,          { foreignKey: 'branchId' });
      // Payments no longer store branch_id directly (removed in 3NF normalization migration 20260413000002)
      // Tenant filtering on payments is done via the Orders association (order_id → orders.branch_id)
      Branch.hasMany(models.UsersBranches,   { foreignKey: 'branchId', as: 'userBranchLinks' });
      Branch.hasMany(models.BranchProducts,  { foreignKey: 'branchId', as: 'branchProductLinks' });
      Branch.belongsToMany(models.User, {
        through: models.UsersBranches,
        foreignKey: 'branchId',
        otherKey: 'userId',
        as: 'users',
      });
      Branch.belongsToMany(models.Products, {
        through: models.BranchProducts,
        foreignKey: 'branchId',
        otherKey: 'productId',
        as: 'products',
      });
    }
  }

  Branch.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      menuStyle: {
        type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
        field: 'menu_style',
        allowNull: false,
        defaultValue: 'A',
      },
    },
    {
      sequelize,
      tableName: 'branches',
      modelName: 'Branch',
    }
  );

  return Branch;
};
