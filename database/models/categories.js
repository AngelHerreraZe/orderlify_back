'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      Categories.hasMany(models.Products, {foreignKey: 'categoryId'})
    }
  }
  Categories.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.ENUM('Entrada','Plato Fuerte','Postre','Bebidas sin alcohol','Bebidas con alcohol','Infantil'),
      allowNull: false,
    }
  }, {
    sequelize,
    tableName: 'categories',
    modelName: 'Categories',
  });
  return Categories;
};