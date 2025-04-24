'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tableId: {
        type: Sequelize.INTEGER,
        field: 'table_id',
        references: {
          model: 'tables',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        field: 'user_id',
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pendiente', 'Preparando', 'Completado', 'Cancelado'),
        defaultValue: 'Pendiente'
      },
      total: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};