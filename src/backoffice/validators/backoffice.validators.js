'use strict';

const { query, body, param } = require('express-validator');

exports.paginationValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

exports.tenantFilterValidators = [
  ...exports.paginationValidators,
  query('plan').optional().isIn(['free', 'basic', 'pro', 'business', 'enterprise']),
  query('status').optional().isIn(['active', 'trial', 'suspended', 'cancelled']),
  query('region').optional().isLength({ min: 2, max: 10 }),
];

exports.tenantIdValidator = [param('id').isInt({ min: 1 }).toInt()];

exports.changePlanValidator = [
  ...exports.tenantIdValidator,
  body('plan').isIn(['free', 'basic', 'pro', 'business', 'enterprise']),
];

exports.reportExportValidator = [
  query('type').isIn(['financial', 'customer', 'growth', 'churn']),
  query('format').isIn(['pdf', 'xlsx', 'csv']),
];

exports.featureFlagUpdateValidator = [
  param('key').isString().isLength({ min: 2, max: 80 }),
  body('enabled').isBoolean(),
];
