const catchAsync = require('../utils/catchAsync');
const adminServices = require('../services/admin.services');
const ReportService = require('../services/report.service');
const { generatePdf } = require('../services/pdf.service');
const AppError = require('../utils/appError');

exports.getOverView = catchAsync(async (req, res) => {
  const dailyOverview = await adminServices.dailyOverview(req.tenant);
  return res.json({ dailyOverview });
});

exports.getWeeklyOverView = catchAsync(async (req, res) => {
  const weeklyOverview = await adminServices.getWeeklyOverView(req.tenant);
  return res.json({ weeklyOverview });
});

exports.getReports = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await adminServices.getReports(startDate, endDate, req.tenant);
  return res.json({ report });
});

exports.genPdf = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Los parámetros startDate y endDate son requeridos', 400));
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return next(new AppError('El formato de fecha debe ser YYYY-MM-DD', 400));
  }

  if (new Date(startDate) > new Date(endDate)) {
    return next(new AppError('startDate no puede ser mayor que endDate', 400));
  }

  const reportData = await ReportService.generatePdfData(startDate, endDate, req.tenant);
  const pdfBuffer = await generatePdf(reportData);

  const sanitize = (str) => (str || 'reporte').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
  const fileName = `${sanitize(reportData.company.name)}-reporte-${startDate}-${endDate}.pdf`;

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Content-Length': pdfBuffer.length,
  });

  return res.send(pdfBuffer);
});
