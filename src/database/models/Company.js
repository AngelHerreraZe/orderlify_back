'use strict';
const { Model } = require('sequelize');
const { generateUniqueSerial } = require('../../utils/generateSerial');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.Branch,     { foreignKey: 'companyId', as: 'branches' });
      Company.hasMany(models.User,       { foreignKey: 'companyId' });
      Company.hasMany(models.Products,   { foreignKey: 'companyId' });
      Company.hasMany(models.Categories, { foreignKey: 'companyId' });
      Company.hasMany(models.Orders,     { foreignKey: 'companyId' });
      Company.hasMany(models.Payments,   { foreignKey: 'companyId' });
    }
  }

  Company.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      legalName: {
        type: DataTypes.STRING(200),
        field: 'legal_name',
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      slogan: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logoUrl: {
        type: DataTypes.TEXT,
        field: 'logo_url',
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'suspended', 'canceled'),
        defaultValue: 'active',
        allowNull: false,
      },
      subdomain: {
        type: DataTypes.STRING(63),
        allowNull: true,
        unique: true,
      },
      serial: {
        type: DataTypes.STRING(35),
        allowNull: true,
        unique: true,
      },
      plan: {
        type: DataTypes.ENUM('uniestacion', 'unisucursal', 'multisucursal'),
        defaultValue: 'unisucursal',
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'companies',
      modelName: 'Company',
      hooks: {
        beforeCreate: async (company) => {
          if (!company.serial) {
            company.serial = await generateUniqueSerial(Company);
          }
        },
      },
    }
  );

  return Company;
};
