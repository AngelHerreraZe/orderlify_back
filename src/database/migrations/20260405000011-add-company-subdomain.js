'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'subdomain', {
      type: Sequelize.STRING(63),
      allowNull: true,
      unique: true,
      after: 'status',
    });

    // Poblar subdominio automáticamente desde el nombre de la empresa
    // Convierte "Mi Restaurante S.A." → "mi-restaurante-sa"
    await queryInterface.sequelize.query(`
      UPDATE companies
      SET subdomain = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g'))
      WHERE subdomain IS NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('companies', 'subdomain');
  },
};
