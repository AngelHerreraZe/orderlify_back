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
      removedIngredients: {
        type: DataTypes.TEXT,
        field: 'removed_ingredients',
        allowNull: true,
        defaultValue: null,
        get() {
          const raw = this.getDataValue('removedIngredients');
          if (!raw) return [];
          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        },
        set(value) {
          this.setDataValue(
            'removedIngredients',
            value && value.length > 0 ? JSON.stringify(value) : null
          );
        },
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
