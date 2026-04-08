'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'serial', {
      type: Sequelize.STRING(35), // 4 × 8 alphanum + 3 dashes
      allowNull: true,
      unique: true,
      after: 'subdomain',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('companies', 'serial');
  },
};
