const { Router } = require('express');
const adminController = require('../controllers/admin.controller');

const router = Router();

router.get('/admin/overview', adminController.getOverView)

router.get('/admin/reports', adminController.getReports)

module.exports = router;
