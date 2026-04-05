'use strict';
const db = require('../database/models/index');

class branchesServices {
  static async getBranchesByCompany(companyId) {
    return db.Branch.findAll({
      where: { companyId, active: true },
      include: [{ model: db.Station, as: 'stations', where: { active: true }, required: false }],
      order: [['id', 'ASC'], [{ model: db.Station, as: 'stations' }, 'id', 'ASC']],
    });
  }

  static async getBranchById(id) {
    return db.Branch.findOne({
      where: { id },
      include: [{ model: db.Station, as: 'stations', where: { active: true }, required: false }],
    });
  }

  static async createBranch(companyId, name, address, phone) {
    return db.Branch.create({ companyId, name, address, phone });
  }

  static async updateBranch(id, data) {
    await db.Branch.update(data, { where: { id } });
  }

  static async deactivateBranch(id) {
    await db.Branch.update({ active: false }, { where: { id } });
  }

  // Resolve context for auto-detection (uniestacion / unisucursal)
  static async resolveAutoContext(companyId) {
    const branches = await db.Branch.findAll({
      where: { companyId, active: true },
      include: [{ model: db.Station, as: 'stations', where: { active: true }, required: false }],
    });

    if (branches.length === 0) return null;

    const branch   = branches[0];
    const stations = branch.stations ?? [];
    const station  = stations.length === 1 ? stations[0] : null;

    return {
      isAuto:    branches.length === 1,
      branchId:  branch.id,
      branchName: branch.name,
      stationId:  station?.id  ?? null,
      stationName: station?.name ?? null,
      branches,
    };
  }
}

module.exports = branchesServices;
