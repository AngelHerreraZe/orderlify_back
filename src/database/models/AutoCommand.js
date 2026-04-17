'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AutoCommand extends Model {
    static associate(models) {
      AutoCommand.belongsTo(models.Tables,  { foreignKey: 'tableId',   as: 'table'   });
      AutoCommand.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
      AutoCommand.belongsTo(models.Branch,  { foreignKey: 'branchId',  as: 'branch'  });
    }
  }

  AutoCommand.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'table_id',
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'company_id',
      },
      branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'branch_id',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      tableName: 'auto_commands',
      modelName: 'AutoCommand',
      underscored: true,
    }
  );

  return AutoCommand;
};
