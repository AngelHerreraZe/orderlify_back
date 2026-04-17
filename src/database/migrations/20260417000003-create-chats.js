'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chats', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      visitor_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: 'ID único generado en el cliente (localStorage)',
      },
      visitor_name: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      visitor_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      assigned_admin_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario admin del panel de operaciones (users.id)',
      },
      status: {
        type: Sequelize.ENUM('open', 'closed', 'pending'),
        allowNull: false,
        defaultValue: 'open',
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('chats', ['visitor_id']);
    await queryInterface.addIndex('chats', ['status']);
    await queryInterface.addIndex('chats', ['company_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chats');
  },
};
