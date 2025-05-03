const { Router } = require('express');
const { createUserValidator } = require('../validators/users.validators');
const userController = require('../controllers/users.controller');

const router = Router();

router.get('/users', userController.getUsersInformations)

router.post('/auth/login', userController.userLogin)

router.post('/auth/register', createUserValidator, userController.create)

router
    .route('/users/:id')
    .get(userController.getUserbyId)
    .put(userController.updateUserInfo)
    .delete(userController.deleteUser)

module.exports = router;