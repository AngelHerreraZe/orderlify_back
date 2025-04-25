const { Router } = require('express');
const { createUserValidator } = require('../validators/users.validators');
const userController = require('../controllers/users.controller');

const router = Router();

router.post('/users/', createUserValidator, userController.create)


module.exports = router;