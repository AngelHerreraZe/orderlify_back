'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('chats', 'chat_type', {
      type: Sequelize.ENUM('customer_service', 'technical_support'),
      allowNull: false,
      defaultValue: 'customer_service',
      comment: 'customer_service = landing page · technical_support = /app',
    });

    await queryInterface.addIndex('chats', ['chat_type']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('chats', 'chat_type');
  },
};
