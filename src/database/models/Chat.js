'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.hasMany(models.ChatMessage, { foreignKey: 'chatId', as: 'messages' });
      Chat.belongsTo(models.Company,   { foreignKey: 'companyId', as: 'company' });
    }
  }

  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      visitorId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: 'visitor_id',
      },
      visitorName: {
        type: DataTypes.STRING(120),
        allowNull: true,
        field: 'visitor_name',
      },
      visitorEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'visitor_email',
      },
      assignedAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'assigned_admin_id',
      },
      status: {
        type: DataTypes.ENUM('open', 'closed', 'pending'),
        allowNull: false,
        defaultValue: 'open',
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'company_id',
      },
      chatType: {
        type: DataTypes.ENUM('customer_service', 'technical_support'),
        allowNull: false,
        defaultValue: 'customer_service',
        field: 'chat_type',
      },
    },
    {
      sequelize,
      tableName: 'chats',
      modelName: 'Chat',
    }
  );

  return Chat;
};
