'use strict';
const { Router } = require('express');
const registrationController = require('../controllers/registration.controller');

const router = Router();

// ── Registro público de empresa — no requiere autenticación ni subdominio ──
router.post('/companies/register', registrationController.register);

module.exports = router;
