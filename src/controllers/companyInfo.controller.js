const catchAsync  = require('../utils/catchAsync');
const companyInfoServices = require('../services/companyInfo.services');
const AppError = require('../utils/appError');

exports.getCompanyInfo = catchAsync(async (req, res) => {
  const info = await companyInfoServices.getCompanyInfo();
  return res.json({ companyInfo: info });
});

exports.validateTenant = catchAsync(async (req, res) => {
  const subdomain = (req.query.subdomain ?? '').trim().toLowerCase();
  if (!subdomain) return res.json({ valid: false, reason: 'missing_subdomain' });

  const result = await companyInfoServices.validateSubdomain(subdomain);
  return res.json(result);
});

exports.updateCompanyInfo = catchAsync(async (req, res) => {
  const { nombre, razonSocial, telefono, email, direccion, latitud, longitud } = req.body;
  const info = await companyInfoServices.updateCompanyInfo({
    nombre, razonSocial, telefono, email, direccion, latitud, longitud,
  });
  return res.json({ companyInfo: info });
});
