'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'status', {
      type: Sequelize.ENUM('active', 'suspended', 'canceled'),
      allowNull: false,
      defaultValue: 'active',
      after: 'active', // MySQL: posición visual junto al campo active
    });

    // Migrar estado existente: si active=false → suspended
    await queryInterface.sequelize.query(`
      UPDATE companies SET status = 'suspended' WHERE active = false;
    `);
    await queryInterface.sequelize.query(`
      UPDATE companies SET status = 'active' WHERE active = true;
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('companies', 'status');
  },
};
