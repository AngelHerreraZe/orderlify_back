const { Router } = require('express');
const { createUserValidator } = require('../validators/users.validators');
const userController = require('../controllers/users.controller');

const router = Router();

router
    .route('/users')
    .post(createUserValidator, userController.create)
    .get(userController.getUsersInformations)

router.post('/auth/login', userController.userLogin)

module.exports = router;