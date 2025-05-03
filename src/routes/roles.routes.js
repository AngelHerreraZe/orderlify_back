const { Router } = require('express');
const rolesCotroler = require('../controllers/roles.controller');

const router = Router();

router
    .route('/roles')
    .post(rolesCotroler.create)
    .get(rolesCotroler.getRoles)

router
    .route('/roles/:id')
    .put(rolesCotroler.updateRole)
    .delete(rolesCotroler.deleteRole)

router.post('/users/:userId/roles/:roleId', rolesCotroler.assignRole)

module.exports = router;