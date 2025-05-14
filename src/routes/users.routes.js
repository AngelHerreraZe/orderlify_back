const { Router } = require('express');
const { createUserValidator } = require('../validators/users.validators');
const userController = require('../controllers/users.controller');
const authenticate = require('../middlewares/auth.middleware');
const {
  isAdmin,
  isCashier,
  isChef,
  isManager,
  isWaiter,
} = require('../middlewares/role.middleware');

const router = Router();

router.get('/users', userController.getUsersInformations);

router.post('/auth/login', userController.userLogin);

router.post(
  '/auth/register',
  createUserValidator,
  authenticate,
  isAdmin,
  userController.create
);

router
  .route('/users/:id')
  .get(userController.getUserbyId)
  .put(authenticate,userController.updateUserInfo)
  .delete(userController.deleteUser);

module.exports = router;
