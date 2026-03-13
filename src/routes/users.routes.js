const { Router } = require('express');
const { createUserValidator } = require('../validators/users.validators');
const userController = require('../controllers/users.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router.get(
  '/users',
  authenticate,
  allowRoles('Admin', 'Manager'),
  userController.getUsersInformations
);

router.post('/auth/login', userController.userLogin);

router.post(
  '/auth/register',
  createUserValidator,
  authenticate,
  allowRoles('Admin', 'Manager'),
  userController.create
);

router
  .route('/users/:id')
  .get(userController.getUserbyId)
  .put(
    authenticate,
    allowRoles('Admin', 'Manager'),
    userController.updateUserInfo
  )
  .delete(
    authenticate,
    allowRoles('Admin', 'Manager'),
    userController.deleteUser
  );

module.exports = router;
