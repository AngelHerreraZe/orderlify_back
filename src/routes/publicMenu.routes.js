'use strict';
const { Router } = require('express');
const publicMenuController = require('../controllers/publicMenu.controller');

const router = Router();

// Public — no authentication required
router.get('/public/menu/:branchId', publicMenuController.getPublicMenu);

module.exports = router;
