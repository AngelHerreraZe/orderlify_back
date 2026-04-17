'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    static associate(models) {
      Payments.belongsTo(models.Orders, { foreignKey: 'orderId' });
    }
  }

  Payments.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      orderId: {
        type: DataTypes.INTEGER,
        field: 'order_id',
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM('Efectivo', 'Tarjeta'),
        defaultValue: 'Efectivo',
      },
      paidAt: {
        type: DataTypes.DATE,
        field: 'paid_at',
        allowNull: false,
      },
      receivedAmount: {
        type: DataTypes.FLOAT,
        field: 'received_amount',
        allowNull: true,
      },
      changeGiven: {
        type: DataTypes.FLOAT,
        field: 'change_given',
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'payments',
      modelName: 'Payments',
    }
  );

  return Payments;
};
