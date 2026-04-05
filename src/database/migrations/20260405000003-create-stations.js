'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      branchId: {
        type: Sequelize.INTEGER,
        field: 'branch_id',
        allowNull: false,
        references: { model: 'branches', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: {
        // e.g. "Caja 1", "Terminal 2"
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('stations', ['branch_id'], { name: 'stations_branch_id_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stations');
  },
};
