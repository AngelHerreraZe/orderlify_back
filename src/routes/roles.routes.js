const { Router } = require('express');
const rolesCotroler = require('../controllers/roles.controller');
const authenticate = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

const router = Router();

router.route('/roles').post(rolesCotroler.create).get(rolesCotroler.getRoles);

router
  .route('/roles/:id')
  .put(rolesCotroler.updateRole)
  .delete(rolesCotroler.deleteRole);

// Solo Admin o Manager pueden asignar roles; Manager no puede asignar Admin/Manager (validado en controller)
router.post(
  '/users/:userId/roles/:roleId',
  authenticate,
  allowRoles('Admin', 'Manager'),
  rolesCotroler.assignRole,
);

module.exports = router;
