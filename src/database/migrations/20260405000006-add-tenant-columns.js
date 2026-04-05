'use strict';
/**
 * Adds multi-tenant FK columns to existing tables.
 * All columns are nullable so existing rows keep working until
 * migration 20260405000007 back-fills them with default values.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── orders ──────────────────────────────────────────────────────────────
    await queryInterface.addColumn('orders', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('orders', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'branches', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('orders', 'station_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'stations', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ─── user ─────────────────────────────────────────────────────────────────
    await queryInterface.addColumn('user', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ─── products ─────────────────────────────────────────────────────────────
    await queryInterface.addColumn('products', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ─── tables ───────────────────────────────────────────────────────────────
    await queryInterface.addColumn('tables', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'branches', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ─── payments ─────────────────────────────────────────────────────────────
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

    // ─── categories ───────────────────────────────────────────────────────────
    await queryInterface.addColumn('categories', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'companies', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ─── Indexes for filtering performance ────────────────────────────────────
    await queryInterface.addIndex('orders',   ['branch_id'],  { name: 'orders_branch_id_idx' });
    await queryInterface.addIndex('orders',   ['company_id'], { name: 'orders_company_id_idx' });
    await queryInterface.addIndex('products', ['company_id'], { name: 'products_company_id_idx' });
    await queryInterface.addIndex('tables',   ['branch_id'],  { name: 'tables_branch_id_idx' });
    await queryInterface.addIndex('payments', ['branch_id'],  { name: 'payments_branch_id_idx' });
  },

  async down(queryInterface) {
    // Remove indexes first
    await queryInterface.removeIndex('orders',   'orders_branch_id_idx').catch(() => {});
    await queryInterface.removeIndex('orders',   'orders_company_id_idx').catch(() => {});
    await queryInterface.removeIndex('products', 'products_company_id_idx').catch(() => {});
    await queryInterface.removeIndex('tables',   'tables_branch_id_idx').catch(() => {});
    await queryInterface.removeIndex('payments', 'payments_branch_id_idx').catch(() => {});

    // Remove columns
    await queryInterface.removeColumn('orders',     'company_id');
    await queryInterface.removeColumn('orders',     'branch_id');
    await queryInterface.removeColumn('orders',     'station_id');
    await queryInterface.removeColumn('user',       'company_id');
    await queryInterface.removeColumn('products',   'company_id');
    await queryInterface.removeColumn('tables',     'branch_id');
    await queryInterface.removeColumn('payments',   'company_id');
    await queryInterface.removeColumn('payments',   'branch_id');
    await queryInterface.removeColumn('categories', 'company_id');
  },
};
