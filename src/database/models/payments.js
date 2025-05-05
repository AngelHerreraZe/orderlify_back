'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    static associate(models) {
      Payments.belongsTo(models.Orders, {foreignKey: 'orderId'})
    }
  }
  Payments.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    orderId: {
      type: DataTypes.INTEGER,
      field: 'order_id',
      allowNull: false,
    },
    ammount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('Efectivo', 'Tarjeta'),
      defaultValue: 'Efectivo'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'payments',
    modelName: 'Payments',
  });
  return Payments;
};