'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('companies', 'slogan');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'slogan', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'address',
    });
  },
};
