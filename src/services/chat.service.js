'use strict';
const db = require('../database/models/index');

class ChatService {
  /** Obtiene o crea una conversación para un visitante */
  static async getOrCreateChat({ visitorId, visitorName, visitorEmail, companyId }) {
    let chat = await db.Chat.findOne({ where: { visitorId, status: 'open' } });
    if (!chat) {
      chat = await db.Chat.create({
        visitorId,
        visitorName,
        visitorEmail,
        companyId: companyId ?? null,
        status: 'open',
      });
    }
    return chat;
  }

  /** Persiste un mensaje y lo devuelve */
  static async saveMessage({ chatId, senderType, senderName, body }) {
    return db.ChatMessage.create({ chatId, senderType, senderName, body });
  }

  /** Lista todos los chats activos para el panel admin */
  static async listChats({ status } = {}) {
    const where = {};
    if (status) where.status = status;
    return db.Chat.findAll({
      where,
      include: [
        {
          model: db.ChatMessage,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });
  }

  /** Historial de mensajes de un chat */
  static async getMessages(chatId) {
    return db.ChatMessage.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']],
    });
  }

  /** Cierra un chat */
  static async closeChat(chatId) {
    await db.Chat.update({ status: 'closed' }, { where: { id: chatId } });
  }

  /** Asigna un agente admin a un chat */
  static async assignAdmin(chatId, adminId) {
    await db.Chat.update({ assignedAdminId: adminId }, { where: { id: chatId } });
  }

  /** Marca todos los mensajes de un chat como leídos */
  static async markRead(chatId) {
    await db.ChatMessage.update(
      { readAt: new Date() },
      { where: { chatId, readAt: null } },
    );
  }
}

module.exports = ChatService;
