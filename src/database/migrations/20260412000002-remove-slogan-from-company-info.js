'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tableInfo = await queryInterface.describeTable('company_info').catch(() => null);
    if (tableInfo && tableInfo.slogan) {
      await queryInterface.removeColumn('company_info', 'slogan');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('company_info', 'slogan', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
