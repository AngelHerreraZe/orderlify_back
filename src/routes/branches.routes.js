'use strict';
const { Router }         = require('express');
const branchesController = require('../controllers/branches.controller');
const authenticate       = require('../middlewares/auth.middleware');
const { allowRoles }     = require('../middlewares/role.middleware');
const { extractTenant }  = require('../middlewares/tenant.middleware');

const router = Router();

// All branch routes require authentication + tenant header extraction.
// Path-scoped so public routes in other routers are not intercepted.
router.use('/branches', authenticate, extractTenant);

// Auto-detect context (all authenticated users need this on login)
router.get('/branches/resolve-context', branchesController.resolveContext);

// CRUD — admin/manager only
router.get('/branches',         allowRoles('Admin', 'Manager'), branchesController.getBranches);
router.get('/branches/:id',     allowRoles('Admin', 'Manager'), branchesController.getBranchById);
router.post('/branches',        allowRoles('Admin'),             branchesController.createBranch);
router.put('/branches/:id',     allowRoles('Admin', 'Manager'), branchesController.updateBranch);
router.delete('/branches/:id',  allowRoles('Admin'),             branchesController.deactivateBranch);

module.exports = router;
