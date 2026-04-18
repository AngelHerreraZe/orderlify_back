'use strict';
const catchAsync  = require('../utils/catchAsync');
const AppError    = require('../utils/appError');
const ChatService = require('../services/chat.service');
const { getIO }   = require('../socket');

/** GET /chats — lista chats activos filtrados por tipo y/o estado */
exports.listChats = catchAsync(async (req, res) => {
  const { status, chatType } = req.query;
  const chats = await ChatService.listChats({ status, chatType });
  return res.json({ status: 'success', chats });
});

/** GET /chats/:id/messages — historial de un chat */
exports.getMessages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const messages = await ChatService.getMessages(id);
  await ChatService.markRead(id);
  return res.json({ status: 'success', messages });
});

/** POST /chats/:id/reply — admin responde */
exports.adminReply = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { body } = req.body;

  if (!body?.trim()) return next(new AppError('El mensaje no puede estar vacío', 400));

  const msg = await ChatService.saveMessage({
    chatId:     id,
    senderType: 'admin',
    senderName: req.user.username ?? 'Admin',
    body:        body.trim(),
  });

  // Notificar al visitante vía socket
  getIO()?.emit('chat:admin_reply', {
    chatId:  parseInt(id),
    message: msg.toJSON(),
  });

  return res.status(201).json({ status: 'success', message: msg });
});

/** PATCH /chats/:id/close */
exports.closeChat = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ChatService.closeChat(id);
  getIO()?.emit('chat:closed', { chatId: parseInt(id) });
  return res.json({ status: 'success', message: 'Chat cerrado' });
});

/** PATCH /chats/:id/assign */
exports.assignAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.body.adminId ?? req.user.id;
  await ChatService.assignAdmin(id, adminId);
  return res.json({ status: 'success' });
});
