'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    static associate(models) {
      Orders.hasMany(models.OrdersItems, {foreignKey: 'orderId'})
      Orders.hasMany(models.Payments, {foreignKey: 'orderId'})
      Orders.belongsTo(models.User, {foreignKey: 'userId'})
      Orders.belongsTo(models.Tables, {foreignKey: 'tableId'})
    }
  }
  Orders.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    tableId: {
      type: DataTypes.INTEGER,
      field: 'table_id',
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Preparando','Completado','Cancelado'),
      defaultValue: 'Pendiente'
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'orders',
    modelName: 'Orders',
  });
  return Orders;
};