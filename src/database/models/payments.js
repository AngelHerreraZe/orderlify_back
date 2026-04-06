'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    static associate(models) {
      Payments.belongsTo(models.Orders,  { foreignKey: 'orderId' });
      Payments.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
      Payments.belongsTo(models.Branch,  { foreignKey: 'branchId',  as: 'branch'  });
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
    },
    {
      sequelize,
      tableName: 'payments',
      modelName: 'Payments',
    }
  );

  return Payments;
};
