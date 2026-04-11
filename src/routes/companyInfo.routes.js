const { Router }            = require('express');
const companyInfoController = require('../controllers/companyInfo.controller');
const authenticate          = require('../middlewares/auth.middleware');
const { allowRoles }        = require('../middlewares/role.middleware');

const router = Router();

router.get('/company-info', companyInfoController.getCompanyInfo);

// Public — called by the frontend on every subdomain to gate the UI
router.get('/tenants/validate', companyInfoController.validateTenant);

router.put(
  '/company-info',
  authenticate,
  allowRoles('Admin'),
  companyInfoController.updateCompanyInfo
);

module.exports = router;
