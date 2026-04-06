const { Router } = require('express');
const cashRegisterController = require('../controllers/cashRegister.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

const ALLOWED = ['Admin', 'Manager', 'Cashier'];

router.get(
  '/cash-register/current',
  authenticate,
  allowRoles(...ALLOWED),
  cashRegisterController.getCurrent
);

router.post(
  '/cash-register/open',
  authenticate,
  allowRoles(...ALLOWED),
  cashRegisterController.openShift
);

router.put(
  '/cash-register/:id/close',
  authenticate,
  allowRoles(...ALLOWED),
  cashRegisterController.closeShift
);

router.get(
  '/cash-register/history',
  authenticate,
  allowRoles(...ALLOWED),
  cashRegisterController.listShifts
);

module.exports = router;
