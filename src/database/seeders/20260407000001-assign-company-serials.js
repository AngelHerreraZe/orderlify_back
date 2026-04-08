'use strict';
const { generateSerial } = require('../../utils/generateSerial');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [companies] = await queryInterface.sequelize.query(
      'SELECT id FROM companies WHERE serial IS NULL ORDER BY id',
    );

    if (companies.length === 0) return;

    const usedSerials = new Set();

    for (const row of companies) {
      let serial;
      let attempts = 0;

      do {
        serial = generateSerial();
        attempts++;
      } while (usedSerials.has(serial) && attempts < 20);

      usedSerials.add(serial);

      await queryInterface.sequelize.query(
        'UPDATE companies SET serial = ? WHERE id = ?',
        { replacements: [serial, row.id] },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'UPDATE companies SET serial = NULL',
    );
  },
};
