const catchAsync  = require('../utils/catchAsync');
const companyInfoServices = require('../services/companyInfo.services');

exports.getCompanyInfo = catchAsync(async (req, res) => {
  const info = await companyInfoServices.getCompanyInfo();
  return res.json({ companyInfo: info });
});

exports.updateCompanyInfo = catchAsync(async (req, res) => {
  const { nombre, razonSocial, telefono, email, direccion, latitud, longitud, slogan } = req.body;
  const info = await companyInfoServices.updateCompanyInfo({
    nombre, razonSocial, telefono, email, direccion, latitud, longitud, slogan,
  });
  return res.json({ companyInfo: info });
});
