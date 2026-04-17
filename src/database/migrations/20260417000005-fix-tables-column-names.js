'use strict';
/**
 * Fix camelCase column names left by the original migrations.
 *
 * Sequelize's queryInterface.createTable() uses the object key as the
 * actual DB column name — the `field` property is ignored there.
 * This means the first batch of migrations created camelCase columns
 * (e.g. `tableNumber`, `orderId`, `paidAt`) while models map them to
 * snake_case via `field:` declarations.
 *
 * This migration renames every affected column to its snake_case form
 * so models and DB are in sync. Each rename is wrapped in .catch(() => {})
 * so re-running on a DB that already has the correct names is safe.
 */
module.exports = {
  async up(queryInterface) {
    // ── tables ────────────────────────────────────────────────────────────────
    await queryInterface.renameColumn('tables', 'tableNumber', 'table_number').catch(() => {});

    // ── orders ────────────────────────────────────────────────────────────────
    await queryInterface.renameColumn('orders', 'tableId', 'table_id').catch(() => {});
    await queryInterface.renameColumn('orders', 'userId',  'user_id').catch(() => {});

    // ── orders_items ──────────────────────────────────────────────────────────
    await queryInterface.renameColumn('orders_items', 'orderId',   'order_id').catch(() => {});
    await queryInterface.renameColumn('orders_items', 'productId', 'product_id').catch(() => {});

    // ── payments ──────────────────────────────────────────────────────────────
    await queryInterface.renameColumn('payments', 'orderId', 'order_id').catch(() => {});
    await queryInterface.renameColumn('payments', 'paidAt',  'paid_at').catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('tables',      'table_number', 'tableNumber').catch(() => {});
    await queryInterface.renameColumn('orders',      'table_id',     'tableId').catch(() => {});
    await queryInterface.renameColumn('orders',      'user_id',      'userId').catch(() => {});
    await queryInterface.renameColumn('orders_items','order_id',     'orderId').catch(() => {});
    await queryInterface.renameColumn('orders_items','product_id',   'productId').catch(() => {});
    await queryInterface.renameColumn('payments',    'order_id',     'orderId').catch(() => {});
    await queryInterface.renameColumn('payments',    'paid_at',      'paidAt').catch(() => {});
  },
};
