const catchAsync = require('../utils/catchAsync');
const adminServices = require('../services/admin.services');
const { generateOrdersReport } = require('../services/excel.service');
const AppError = require('../utils/appError');
const fs = require('fs');
const path = require('path');

exports.getOverView = catchAsync(async (req, res) => {
  const dailyOverview = await adminServices.dailyOverview();
  return res.json({ dailyOverview });
});

exports.getWeeklyOverView = catchAsync(async (req, res) => {
  const weeklyOverview = await adminServices.getWeeklyOverView();
  return res.json({ weeklyOverview });
});

exports.getReports = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await adminServices.getReports(startDate, endDate);
  return res.json({ report });
});

exports.genExcel = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.params;
  const totalSales = await adminServices.genExcel(startDate, endDate);
  const workbook = await generateOrdersReport(totalSales);
  const filePath = path.join(__dirname, '../temp/reporte_ventas.xlsx');
  await workbook.xlsx.writeFile(filePath);
  res.download(filePath, 'reporte_ventas.xlsx', (err) => {
    fs.unlink(filePath, () => {});
    if (err) next(new AppError('Error sending the file', 500));
  });
});
