'use strict';

const express = require('express');
const authenticate = require('../../middlewares/auth.middleware');
const { allowRoles } = require('../../middlewares/role.middleware');
const controller = require('../controllers/backoffice.controller');
const validators = require('../validators/backoffice.validators');

const router = express.Router();
const adminRoles = allowRoles('admin', 'support', 'finance');

router.use(authenticate, adminRoles);

router.get('/dashboard', controller.getDashboard);
router.get('/tenants', validators.tenantFilterValidators, controller.listTenants);
router.get('/tenants/:id', validators.tenantIdValidator, controller.getTenantDetail);
router.post('/tenants/:id/impersonate', validators.tenantIdValidator, controller.impersonateTenant);
router.patch('/tenants/:id/plan', validators.changePlanValidator, controller.changeTenantPlan);
router.patch('/tenants/:id/suspend', validators.tenantIdValidator, controller.suspendTenant);
router.patch('/tenants/:id/reactivate', validators.tenantIdValidator, controller.reactivateTenant);
router.post('/tenants/:id/reset-configuration', validators.tenantIdValidator, controller.resetTenantConfiguration);

router.get('/subscriptions/plans', controller.getBillingPlans);
router.get('/analytics', validators.paginationValidators, controller.getAnalytics);
router.get('/analytics/export', controller.exportAnalytics);

router.get('/tickets', validators.paginationValidators, controller.listTickets);
router.get('/system-configuration', controller.getSystemConfiguration);
router.get('/monitoring', controller.getMonitoring);
router.get('/marketing', controller.getMarketing);
router.get('/security', controller.getSecurity);

router.get('/reports', controller.getReports);
router.get('/reports/download', validators.reportExportValidator, controller.downloadReport);

router.get('/feature-flags', controller.getFeatureFlags);
router.patch('/feature-flags/:key', validators.featureFlagUpdateValidator, controller.updateFeatureFlag);

router.get('/automations', controller.getAutomations);

module.exports = router;
