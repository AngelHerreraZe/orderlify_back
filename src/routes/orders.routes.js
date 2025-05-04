const { Router } = require('express');
const ordersController = require('../controllers/orders.controller');

const router = Router();

router.route('/orders').post(ordersController.createOrder);

module.exports = router;
