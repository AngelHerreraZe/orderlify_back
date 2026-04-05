'use strict';
/**
 * Tenant context middleware.
 *
 * Reads x-company-id and x-branch-id from request headers (sent by the
 * frontend) and attaches them to req.tenant so any controller/service can
 * use them without re-reading headers manually.
 *
 * Falls back gracefully: if headers are absent the values are null, which
 * causes queries to omit the WHERE clause filter (backwards-compatible with
 * single-tenant mode).
 */
const extractTenant = (req, _res, next) => {
  const companyId  = parseInt(req.headers['x-company-id'],  10) || null;
  const branchId   = parseInt(req.headers['x-branch-id'],   10) || null;
  const stationId  = parseInt(req.headers['x-station-id'],  10) || null;

  req.tenant = { companyId, branchId, stationId };
  next();
};

module.exports = { extractTenant };
