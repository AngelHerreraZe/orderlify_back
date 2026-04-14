'use strict';
/**
 * Normalization migration — 2026-04-13
 *
 * Changes applied:
 *  1. Add latitud / longitud to companies (absorb company_info unique fields)
 *  2. Drop company_info table (singleton with no company_id FK — duplicate of companies)
 *  3. categories.name  ENUM → VARCHAR(100)  (allows custom per-company categories)
 *  4. payments: drop company_id, branch_id  (3NF — transitively dependent via order_id)
 *  5. cash_registers: drop company_id       (3NF — transitively dependent via branch_id)
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. companies: add geo columns ─────────────────────────────────────────
    await queryInterface.addColumn('companies', 'latitud', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'longitud', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });

    // ── 2. Drop company_info ──────────────────────────────────────────────────
    // Note: company_info had no company_id FK so data cannot be auto-migrated.
    // Existing info must be re-entered through PUT /company-info per tenant.
    await queryInterface.dropTable('company_info');

    // ── 3. categories.name: ENUM → VARCHAR(100) ───────────────────────────────
    await queryInterface.changeColumn('categories', 'name', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    // ── 4. payments: remove transitive FK columns ─────────────────────────────
    await queryInterface.removeColumn('payments', 'company_id');
    await queryInterface.removeColumn('payments', 'branch_id');

    // ── 5. cash_registers: remove transitive company_id ──────────────────────
    await queryInterface.removeColumn('cash_registers', 'company_id');
  },

  async down(queryInterface, Sequelize) {
    // ── 5. Restore cash_registers.company_id ─────────────────────────────────
    await queryInterface.addColumn('cash_registers', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ── 4. Restore payments columns ───────────────────────────────────────────
    await queryInterface.addColumn('payments', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('payments', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'branches', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ── 3. categories.name: VARCHAR → ENUM ────────────────────────────────────
    await queryInterface.changeColumn('categories', 'name', {
      type: Sequelize.ENUM(
        'Entrada', 'Plato Fuerte', 'Postre',
        'Bebidas sin alcohol', 'Bebidas con alcohol', 'Infantil'
      ),
      allowNull: false,
    });

    // ── 2. Re-create company_info ─────────────────────────────────────────────
    await queryInterface.createTable('company_info', {
      id:          { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre:      { type: Sequelize.STRING, allowNull: true },
      razon_social:{ type: Sequelize.STRING, allowNull: true },
      telefono:    { type: Sequelize.STRING, allowNull: true },
      email:       { type: Sequelize.STRING, allowNull: true },
      direccion:   { type: Sequelize.STRING, allowNull: true },
      latitud:     { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      longitud:    { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      createdAt:   { allowNull: false, type: Sequelize.DATE },
      updatedAt:   { allowNull: false, type: Sequelize.DATE },
    });

    // ── 1. Remove geo columns from companies ──────────────────────────────────
    await queryInterface.removeColumn('companies', 'longitud');
    await queryInterface.removeColumn('companies', 'latitud');
  },
};
