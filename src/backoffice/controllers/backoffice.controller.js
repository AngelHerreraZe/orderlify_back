'use strict';

const { validationResult } = require('express-validator');
const service = require('../services/backoffice.service');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const ok = (res, data) => res.status(200).json({ status: 'success', data });

exports.getDashboard = (req, res) => ok(res, service.getDashboardOverview());
exports.listTenants = (req, res) => {
  if (!validate(req, res)) return;
  ok(res, service.listTenants(req.query));
};
exports.getTenantDetail = (req, res) => ok(res, service.getTenantDetail(req.params.id));
exports.impersonateTenant = (req, res) => ok(res, { tenantId: Number(req.params.id), sessionToken: 'impersonation-jwt-token' });
exports.changeTenantPlan = (req, res) => ok(res, { tenantId: Number(req.params.id), plan: req.body.plan, changedAt: new Date().toISOString() });
exports.suspendTenant = (req, res) => ok(res, { tenantId: Number(req.params.id), status: 'suspended' });
exports.reactivateTenant = (req, res) => ok(res, { tenantId: Number(req.params.id), status: 'active' });
exports.resetTenantConfiguration = (req, res) => ok(res, { tenantId: Number(req.params.id), reset: true });

exports.getBillingPlans = (req, res) => ok(res, service.getPlans());
exports.getAnalytics = (req, res) => ok(res, service.getAnalytics(req.query));
exports.exportAnalytics = (req, res) => ok(res, { format: req.query.format || 'csv', exportedAt: new Date().toISOString() });
exports.listTickets = (req, res) => ok(res, service.listTickets(req.query));
exports.getSystemConfiguration = (req, res) => ok(res, service.getSystemConfiguration());
exports.getMonitoring = (req, res) => ok(res, service.getMonitoring());
exports.getMarketing = (req, res) => ok(res, service.getMarketing());
exports.getSecurity = (req, res) => ok(res, service.getSecurity());
exports.getReports = (req, res) => ok(res, service.getReports());
exports.downloadReport = (req, res) => ok(res, { type: req.query.type, format: req.query.format, generatedAt: new Date().toISOString() });
exports.getFeatureFlags = (req, res) => ok(res, service.getSystemConfiguration().featureFlags);
exports.updateFeatureFlag = (req, res) => ok(res, { key: req.params.key, enabled: Boolean(req.body.enabled), updatedAt: new Date().toISOString() });
exports.getAutomations = (req, res) => ok(res, service.getAutomations());
