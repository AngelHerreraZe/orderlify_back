const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router.get(
  '/admin/overview',
  authenticate,
  allowRoles('Admin', 'Manager'),
  adminController.getOverView
);

router.get(
  '/admin/weeklyoverview',
  authenticate,
  allowRoles('Admin', 'Manager'),
  adminController.getWeeklyOverView
);

router.get(
  '/admin/reports',
  authenticate,
  allowRoles('Admin', 'Manager'),
  adminController.getReports
);

router.get(
  '/admin/reports/excel/:startDate/:endDate',
  authenticate,
  allowRoles('Admin', 'Manager'),
  adminController.genExcel
);

module.exports = router;
