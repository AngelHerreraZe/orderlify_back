'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      legalName: {
        type: Sequelize.STRING(200),
        field: 'legal_name',
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      slogan: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      logoUrl: {
        type: Sequelize.TEXT,
        field: 'logo_url',
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      plan: {
        // uniestacion | unisucursal | multisucursal
        type: Sequelize.ENUM('uniestacion', 'unisucursal', 'multisucursal'),
        defaultValue: 'unisucursal',
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('companies');
  },
};
