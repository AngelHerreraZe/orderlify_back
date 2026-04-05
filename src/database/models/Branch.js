'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    static associate(models) {
      Branch.belongsTo(models.Company,       { foreignKey: 'companyId', as: 'company' });
      Branch.hasMany(models.Station,         { foreignKey: 'branchId',  as: 'stations' });
      Branch.hasMany(models.Tables,          { foreignKey: 'branchId' });
      Branch.hasMany(models.Orders,          { foreignKey: 'branchId' });
      Branch.hasMany(models.Payments,        { foreignKey: 'branchId' });
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
    },
    {
      sequelize,
      tableName: 'branches',
      modelName: 'Branch',
    }
  );

  return Branch;
};
