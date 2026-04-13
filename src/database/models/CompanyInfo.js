'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompanyInfo extends Model {
    static associate(models) {
      // Sin relaciones
    }
  }
  CompanyInfo.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razonSocial: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'razon_social',
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitud: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitud: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'company_info',
    modelName: 'CompanyInfo',
  });
  return CompanyInfo;
};
