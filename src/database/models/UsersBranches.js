'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsersBranches extends Model {
    static associate(models) {
      UsersBranches.belongsTo(models.User,   { foreignKey: 'userId' });
      UsersBranches.belongsTo(models.Branch, { foreignKey: 'branchId' });
    }
  }

  UsersBranches.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        allowNull: false,
      },
      branchId: {
        type: DataTypes.INTEGER,
        field: 'branch_id',
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'users_branches',
      modelName: 'UsersBranches',
    }
  );

  return UsersBranches;
};
