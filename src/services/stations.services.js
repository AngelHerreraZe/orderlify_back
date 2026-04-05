'use strict';
const db = require('../database/models/index');

class stationsServices {
  static async getStationsByBranch(branchId) {
    return db.Station.findAll({
      where: { branchId, active: true },
      order: [['id', 'ASC']],
    });
  }

  static async createStation(branchId, name) {
    return db.Station.create({ branchId, name });
  }

  static async updateStation(id, data) {
    await db.Station.update(data, { where: { id } });
  }

  static async deactivateStation(id) {
    await db.Station.update({ active: false }, { where: { id } });
  }
}

module.exports = stationsServices;
