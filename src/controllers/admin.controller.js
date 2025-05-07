const catchAsync = require('../utils/catchAsync');
const adminServices = require('../services/admin.services');

exports.getOverView = catchAsync(async (req, res, next) => {
    console.log("overview");
    next()
});

exports.getReports = catchAsync(async (req, res, next) => {
    console.log("reports");
    next()
});