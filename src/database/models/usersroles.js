'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersRoles extends Model {
    static associate(models) {
      UsersRoles.belongsTo(models.User, {foreignKey: 'userId'})
      UsersRoles.belongsTo(models.Roles, {foreignKey: 'roleId'})
    }
  }
  UsersRoles.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      field: 'role_id',
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'users_roles',
    modelName: 'UsersRoles',
  });
  return UsersRoles;
};