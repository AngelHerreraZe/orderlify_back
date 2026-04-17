'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auto_commands', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      table_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tables', key: 'id' },
        onDelete: 'CASCADE',
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onDelete: 'SET NULL',
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'branches', key: 'id' },
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('auto_commands', ['table_id'], { unique: true });
    await queryInterface.addIndex('auto_commands', ['company_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('auto_commands');
  },
};
