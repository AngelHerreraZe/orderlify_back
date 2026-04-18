'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrdersItems extends Model {
    static associate(models) {
      OrdersItems.belongsTo(models.Products, { foreignKey: 'productId' });
      OrdersItems.belongsTo(models.Orders, { foreignKey: 'orderId' });
    }
  }

  OrdersItems.init(
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
      productId: {
        type: DataTypes.INTEGER,
        field: 'product_id',
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      itemStatus: {
        type: DataTypes.ENUM('Pendiente', 'Preparando', 'Listo'),
        field: 'item_status',
        allowNull: false,
        defaultValue: 'Pendiente',
      },
    },
    {
      sequelize,
      tableName: 'orders_items',
      modelName: 'OrdersItems',
    }
  );

  return OrdersItems;
};
