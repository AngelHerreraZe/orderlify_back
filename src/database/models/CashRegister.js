'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CashRegister extends Model {
    static associate(models) {
      CashRegister.belongsTo(models.User,   { foreignKey: 'openedBy', as: 'opener' });
      CashRegister.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
    }
  }

  CashRegister.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      openedAt: {
        type: DataTypes.DATE,
        field: 'opened_at',
        allowNull: false,
      },
      closedAt: {
        type: DataTypes.DATE,
        field: 'closed_at',
        allowNull: true,
      },
      openingBalance: {
        type: DataTypes.FLOAT,
        field: 'opening_balance',
        allowNull: false,
        defaultValue: 0,
      },
      closingBalance: {
        type: DataTypes.FLOAT,
        field: 'closing_balance',
        allowNull: true,
      },
      totalCashReceived: {
        type: DataTypes.FLOAT,
        field: 'total_cash_received',
        allowNull: true,
        defaultValue: 0,
      },
      expectedBalance: {
        type: DataTypes.FLOAT,
        field: 'expected_balance',
        allowNull: true,
      },
      difference: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open',
        allowNull: false,
      },
      openedBy: {
        type: DataTypes.INTEGER,
        field: 'opened_by',
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
      tableName: 'cash_registers',
      modelName: 'CashRegister',
    }
  );

  return CashRegister;
};
