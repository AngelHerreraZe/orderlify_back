const catchAsync          = require('../utils/catchAsync');
const companyInfoServices = require('../services/companyInfo.services');
const db                  = require('../database/models/index');

/**
 * Resolve the companyId for public (unauthenticated) requests.
 * Falls back to reading the x-subdomain header sent by the frontend Axios interceptor.
 */
async function resolveCompanyId(req) {
  if (req.tenant?.companyId) return req.tenant.companyId;

  const subdomain = (req.headers['x-subdomain'] ?? '').trim().toLowerCase();
  if (!subdomain) return null;

  const company = await db.Company.findOne({
    where:      { subdomain },
    attributes: ['id'],
  });
  return company?.id ?? null;
}

exports.getCompanyInfo = catchAsync(async (req, res) => {
  const companyId = await resolveCompanyId(req);
  const info      = await companyInfoServices.getCompanyInfo(companyId);
  return res.json({ companyInfo: info });
});

// Public — called by the frontend to gate the UI on every subdomain
exports.validateTenant = catchAsync(async (req, res) => {
  const subdomain = (req.query.subdomain ?? '').trim().toLowerCase();
  if (!subdomain) return res.json({ valid: false, reason: 'missing_subdomain' });

  const result = await companyInfoServices.validateSubdomain(subdomain);
  return res.json(result);
});

exports.updateCompanyInfo = catchAsync(async (req, res) => {
  const companyId = req.tenant?.companyId;
  const { name, legalName, phone, email, address, latitud, longitud } = req.body;

  const info = await companyInfoServices.updateCompanyInfo(companyId, {
    name, legalName, phone, email, address, latitud, longitud,
  });
  return res.json({ companyInfo: info });
});
