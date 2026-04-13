'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    static associate(models) {
      Orders.hasMany(models.OrdersItems, { foreignKey: 'orderId' });
      Orders.hasMany(models.Payments,    { foreignKey: 'orderId' });
      Orders.belongsTo(models.User,      { foreignKey: 'userId',    as: 'user'    });
      Orders.belongsTo(models.Tables,    { foreignKey: 'tableId',   as: 'table'   });
      Orders.belongsTo(models.Company,   { foreignKey: 'companyId', as: 'company' });
      Orders.belongsTo(models.Branch,    { foreignKey: 'branchId',  as: 'branch'  });
      Orders.belongsTo(models.Station,   { foreignKey: 'stationId', as: 'station' });
    }
  }

  Orders.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      tableId: {
        type: DataTypes.INTEGER,
        field: 'table_id',
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: true,
      },
      branchId: {
        type: DataTypes.INTEGER,
        field: 'branch_id',
        allowNull: true,
      },
      stationId: {
        type: DataTypes.INTEGER,
        field: 'station_id',
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Pendiente', 'Preparando', 'Completado', 'Cancelado'),
        defaultValue: 'Pendiente',
      },
      serviceType: {
        type: DataTypes.ENUM('mesa', 'pickup', 'delivery'),
        field: 'service_type',
        allowNull: true,
        defaultValue: null,
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'orders',
      modelName: 'Orders',
    }
  );

  return Orders;
};
