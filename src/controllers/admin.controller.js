const catchAsync = require('../utils/catchAsync');
const adminServices = require('../services/admin.services');
const { generateOrdersReport } = require('../services/excel.service');
const fs = require('fs');
const path = require('path');

exports.getOverView = catchAsync(async (req, res, next) => {
  try {
    const dailyOverview = await adminServices.dailyOvewview();
    return res.json({ dailyOverview });
  } catch (error) {
    throw error;
  }
});

exports.getWeeklyOverView = catchAsync(async (req, res, next) => {
  try {
    const weeklyOverview = await adminServices.getWeeklyOverView();
    return res.json({ weeklyOverview });
  } catch (error) {
    throw error;
  }
});

exports.getReports = catchAsync(async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await adminServices.getReports(startDate, endDate);
    return res.json({ report });
  } catch (error) {
    throw error;
  }
});

exports.genExcel = catchAsync(async (req, res, next) => {
  try {
    const { startDate, endDate } = req.params;

    // Llamar al servicio para obtener los datos
    const totalSales = await adminServices.genExcel(startDate, endDate);

    // Generar el reporte Excel
    const workbook = await generateOrdersReport(totalSales);

    // Guardar temporalmente el archivo
    const filePath = path.join(__dirname, '../temp/reporte_ventas.xlsx');
    await workbook.xlsx.writeFile(filePath);

    // Enviar el archivo al cliente
    res.download(filePath, 'reporte_ventas.xlsx', () => {
      fs.unlinkSync(filePath); // Eliminar archivo temporal después de la descarga
    });
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    res.status(500).json({ message: 'Error al generar el archivo Excel' });
  }
});
