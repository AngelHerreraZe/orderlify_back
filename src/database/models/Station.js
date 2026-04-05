'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Station extends Model {
    static associate(models) {
      Station.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
      Station.hasMany(models.Orders,   { foreignKey: 'stationId' });
    }
  }

  Station.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      branchId: {
        type: DataTypes.INTEGER,
        field: 'branch_id',
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'stations',
      modelName: 'Station',
    }
  );

  return Station;
};
