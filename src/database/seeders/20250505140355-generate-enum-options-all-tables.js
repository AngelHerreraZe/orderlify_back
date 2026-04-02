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
        name: 'Waiter',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Chef',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Cashier',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Manager',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
