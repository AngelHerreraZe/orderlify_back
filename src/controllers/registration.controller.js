'use strict';
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { registerCompany } = require('../services/registration.service');

const VALID_PLANS = ['uniestacion', 'unisucursal', 'multisucursal'];
const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

exports.register = catchAsync(async (req, res, next) => {
  const { name, legalName, phone, email, address, subdomain, plan } = req.body;

  // ── Basic validation ───────────────────────────────────────────────────────
  if (!name || !name.trim()) {
    return next(new AppError('El nombre de la empresa es requerido', 400));
  }
  if (!email || !email.trim()) {
    return next(new AppError('El correo electrónico es requerido', 400));
  }
  if (!subdomain || !subdomain.trim()) {
    return next(new AppError('El subdominio es requerido', 400));
  }
  if (!SUBDOMAIN_RE.test(subdomain.trim().toLowerCase())) {
    return next(
      new AppError(
        'El subdominio solo puede contener letras minúsculas, números y guiones, y no puede empezar ni terminar con guión.',
        400,
      ),
    );
  }
  if (plan && !VALID_PLANS.includes(plan)) {
    return next(new AppError('Plan inválido', 400));
  }

  const result = await registerCompany({
    name: name.trim(),
    legalName: legalName?.trim() || null,
    phone: phone?.trim() || null,
    email: email.trim().toLowerCase(),
    address: address?.trim() || null,
    subdomain: subdomain.trim().toLowerCase(),
    plan: plan || 'unisucursal',
  });

  return res.status(201).json({
    status: 'success',
    message: 'Empresa registrada exitosamente. Revisa tu correo para las credenciales de acceso.',
    data: {
      subdomain: result.subdomain,
    },
  });
});
