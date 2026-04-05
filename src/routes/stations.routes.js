'use strict';
const { Router }          = require('express');
const stationsController  = require('../controllers/stations.controller');
const authenticate        = require('../middlewares/auth.middleware');
const { allowRoles }      = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

router.get('/branches/:branchId/stations',        allowRoles('Admin', 'Manager'), stationsController.getStations);
router.post('/branches/:branchId/stations',       allowRoles('Admin'),             stationsController.createStation);
router.put('/branches/:branchId/stations/:id',    allowRoles('Admin', 'Manager'), stationsController.updateStation);
router.delete('/branches/:branchId/stations/:id', allowRoles('Admin'),             stationsController.deactivateStation);

module.exports = router;
