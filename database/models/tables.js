'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tables extends Model {
    static associate(models) {
      Tables.hasMany(models.Orders, {foreignKey: 'tableId'})
    }
  }
  Tables.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4
    }
  }, {
    sequelize,
    tableName: 'tables',
    modelName: 'Tables',
  });
  return Tables;
};