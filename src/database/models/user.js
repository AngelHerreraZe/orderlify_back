'use strict';
const bcrypt = require('bcrypt');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Orders,        { foreignKey: 'userId' });
      User.hasMany(models.UsersRoles,    { foreignKey: 'userId' });
      User.hasMany(models.UsersBranches, { foreignKey: 'userId', as: 'userBranchLinks' });
      User.belongsTo(models.Company,     { foreignKey: 'companyId', as: 'company' });
      User.belongsToMany(models.Branch, {
        through: models.UsersBranches,
        foreignKey: 'userId',
        otherKey: 'branchId',
        as: 'branches',
      });
      User.hasMany(models.UserSession, { foreignKey: 'userId', as: 'sessions' });
    }
  }

  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      passwordChanged: {
        type: DataTypes.BOOLEAN,
        field: 'password_changed',
        defaultValue: false,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        field: 'company_id',
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'user',
      hooks: {
        beforeCreate: async (user) => {
          try {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          } catch (error) {
            throw error;
          }
        },
      },
    }
  );

  return User;
};
