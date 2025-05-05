'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { Categories, Roles } = require('../models');
    await Categories.bulkCreate([
      {
        name: 'Entrada',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Plato Fuerte',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Postre',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bebidas sin alcohol',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bebidas con alcohol',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Infantil',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await Roles.bulkCreate([
      {
        name: 'Mesero',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Cocinero',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Cajero',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Gerente',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const { Categories, Roles } = require('../models');
    await Categories.bulkDelete({ where: {} });
    await Roles.bulkDelete({ where: {} });
  },
};
