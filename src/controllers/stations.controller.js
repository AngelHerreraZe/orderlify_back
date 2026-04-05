'use strict';
const catchAsync        = require('../utils/catchAsync');
const stationsServices  = require('../services/stations.services');

exports.getStations = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const stations = await stationsServices.getStationsByBranch(branchId);
  return res.json({ stations });
});

exports.createStation = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const { name } = req.body;
  const station = await stationsServices.createStation(branchId, name);
  return res.status(201).json({ station });
});

exports.updateStation = catchAsync(async (req, res) => {
  await stationsServices.updateStation(req.params.id, req.body);
  return res.sendStatus(204);
});

exports.deactivateStation = catchAsync(async (req, res) => {
  await stationsServices.deactivateStation(req.params.id);
  return res.sendStatus(204);
});
