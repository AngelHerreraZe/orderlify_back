'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cash_registers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      openedAt: {
        field: 'opened_at',
        type: Sequelize.DATE,
        allowNull: false,
      },
      closedAt: {
        field: 'closed_at',
        type: Sequelize.DATE,
        allowNull: true,
      },
      openingBalance: {
        field: 'opening_balance',
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      closingBalance: {
        field: 'closing_balance',
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      totalCashReceived: {
        field: 'total_cash_received',
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      expectedBalance: {
        field: 'expected_balance',
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      difference: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('open', 'closed'),
        defaultValue: 'open',
        allowNull: false,
      },
      openedBy: {
        field: 'opened_by',
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      companyId: {
        field: 'company_id',
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      branchId: {
        field: 'branch_id',
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'branches', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cash_registers');
  },
};
