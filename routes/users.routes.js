const { Router } = require('express');
const { createUserValidator } = require('../validators/users.validators');
const userController = require('../controllers/users.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = Router();

router
    .route('/users')


module.exports = router;