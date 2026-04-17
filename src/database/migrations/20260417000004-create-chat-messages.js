'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      chat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'chats', key: 'id' },
        onDelete: 'CASCADE',
      },
      sender_type: {
        type: Sequelize.ENUM('visitor', 'admin'),
        allowNull: false,
      },
      sender_name: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('chat_messages', ['chat_id']);
    await queryInterface.addIndex('chat_messages', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_messages');
  },
};
