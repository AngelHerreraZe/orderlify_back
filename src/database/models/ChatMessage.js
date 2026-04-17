'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      ChatMessage.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    }
  }

  ChatMessage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'chat_id',
      },
      senderType: {
        type: DataTypes.ENUM('visitor', 'admin'),
        allowNull: false,
        field: 'sender_type',
      },
      senderName: {
        type: DataTypes.STRING(120),
        allowNull: true,
        field: 'sender_name',
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'read_at',
      },
    },
    {
      sequelize,
      tableName: 'chat_messages',
      modelName: 'ChatMessage',
    }
  );

  return ChatMessage;
};
