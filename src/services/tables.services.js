const db = require('../database/models/index');

class tablesServices {
  static async createTable(tableNumber, capacity) {
    try {
      await db.Tables.create({
        tableNumber,
        capacity,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getTables() {
    try {
      const tables = await db.Tables.findAll({
        include: { all: true },
      });
      return tables;
    } catch (error) {
      throw error;
    }
  }

  static async updateTable(id, tableNumber, capacity) {
    try {
      await db.Tables.update({ tableNumber, capacity }, { where: { id } });
    } catch (error) {
      throw error;
    }
  }

  static async deleteTable(id) {
    try {
      await db.Tables.destroy({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = tablesServices;
