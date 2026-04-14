'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      Categories.hasMany(models.Products, { foreignKey: 'categoryId' });
      Categories.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
    }
  }

  Categories.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING(100),
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
      tableName: 'categories',
      modelName: 'Categories',
    }
  );

  return Categories;
};
