'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('payments', 'ammount', 'amount');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('payments', 'amount', 'ammount');
  },
};
