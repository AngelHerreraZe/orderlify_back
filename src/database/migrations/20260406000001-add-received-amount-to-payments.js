'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payments', 'received_amount', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('payments', 'change_given', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('payments', 'received_amount');
    await queryInterface.removeColumn('payments', 'change_given');
  },
};
