'use strict';
const db = require('../database/models/index');

class tablesServices {
  static async createTable(tableNumber, capacity, branchId = null) {
    const table = await db.Tables.create({ tableNumber, capacity, branchId });
    return table.toJSON();
  }

  static async getTables(tenant = {}) {
    const where = {};
    if (tenant.branchId) where.branchId = tenant.branchId;

    const tables = await db.Tables.findAll({
      where,
      include: { all: true },
    });
    return tables;
  }

  static async updateTable(id, tableNumber, capacity) {
    await db.Tables.update({ tableNumber, capacity }, { where: { id } });
  }

  static async deleteTable(id) {
    await db.Tables.destroy({ where: { id } });
  }
}

module.exports = tablesServices;
