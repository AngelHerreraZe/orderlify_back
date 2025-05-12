const catchAsync = require('../utils/catchAsync');
const adminServices = require('../services/admin.services');

exports.getOverView = catchAsync(async (req, res, next) => {
  try {
    const dailyOverview = await adminServices.dailyOvewview();
    return res.json({ dailyOverview });
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
