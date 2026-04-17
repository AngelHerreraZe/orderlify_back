const { Router } = require('express');
const chatController = require('../controllers/chat.controller');
const authenticate   = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

// Todos los endpoints del chat requieren autenticación + rol de staff
const staffRoles = ['Admin', 'Manager'];

router.get(
  '/chats',
  authenticate,
  allowRoles(...staffRoles),
  chatController.listChats,
);

router.get(
  '/chats/:id/messages',
  authenticate,
  allowRoles(...staffRoles),
  chatController.getMessages,
);

router.post(
  '/chats/:id/reply',
  authenticate,
  allowRoles(...staffRoles),
  chatController.adminReply,
);

router.patch(
  '/chats/:id/close',
  authenticate,
  allowRoles(...staffRoles),
  chatController.closeChat,
);

router.patch(
  '/chats/:id/assign',
  authenticate,
  allowRoles(...staffRoles),
  chatController.assignAdmin,
);

module.exports = router;
