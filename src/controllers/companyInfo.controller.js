const catchAsync = require('../utils/catchAsync');
const companyInfoServices = require('../services/companyInfo.services');
const AppError = require('../utils/appError');

exports.getCompanyInfo = catchAsync(async (req, res) => {
  const info = await companyInfoServices.getCompanyInfo();
  return res.json({ companyInfo: info });
});

exports.validateTenant = catchAsync(async (req, res, next) => {
  // 🔥 aceptar ambos (compatibilidad)
  const slug = (req.query.slug || req.query.subdomain || '')
    .trim()
    .toLowerCase();

  if (!slug) {
    return next(new AppError('slug requerido', 400));
  }

  const company = await companyInfoServices.validateSubdomain(slug);

  // ❌ no existe → 404 REAL (clave para el Worker)
  if (!company) {
    return res.status(404).json({
      exists: false,
      slug,
    });
  }

  // ✅ existe
  return res.status(200).json({
    exists: true,
    slug,
    // opcional (útil para cache o edge en el futuro)
    companyId: company.id,
  });
});

exports.updateCompanyInfo = catchAsync(async (req, res) => {
  const {
    nombre,
    razonSocial,
    telefono,
    email,
    direccion,
    latitud,
    longitud,
    slogan,
  } = req.body;
  const info = await companyInfoServices.updateCompanyInfo({
    nombre,
    razonSocial,
    telefono,
    email,
    direccion,
    latitud,
    longitud,
    slogan,
  });
  return res.json({ companyInfo: info });
});
