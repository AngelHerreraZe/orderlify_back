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

// GET /admin/reports/pdf?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
  '/admin/reports/pdf',
  authenticate,
  allowRoles('Admin', 'Manager'),
  adminController.genPdf
);

router.get(
  '/admin/corporate/summary',
  authenticate,
  allowRoles('Admin', 'Manager'),
  adminController.getCorporateSummary
);

module.exports = router;
