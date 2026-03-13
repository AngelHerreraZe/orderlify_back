'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('orders', ['user_id'], { name: 'idx_orders_user_id' });
    await queryInterface.addIndex('orders', ['table_id'], { name: 'idx_orders_table_id' });
    await queryInterface.addIndex('orders', ['status'], { name: 'idx_orders_status' });
    await queryInterface.addIndex('orders', ['createdAt'], { name: 'idx_orders_created_at' });
    await queryInterface.addIndex('orders_items', ['order_id'], { name: 'idx_orders_items_order_id' });
    await queryInterface.addIndex('orders_items', ['product_id'], { name: 'idx_orders_items_product_id' });
    await queryInterface.addIndex('payments', ['order_id'], { name: 'idx_payments_order_id' });
    await queryInterface.addIndex('users_roles', ['user_id'], { name: 'idx_users_roles_user_id' });
    await queryInterface.addIndex('users_roles', ['role_id'], { name: 'idx_users_roles_role_id' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('orders', 'idx_orders_user_id');
    await queryInterface.removeIndex('orders', 'idx_orders_table_id');
    await queryInterface.removeIndex('orders', 'idx_orders_status');
    await queryInterface.removeIndex('orders', 'idx_orders_created_at');
    await queryInterface.removeIndex('orders_items', 'idx_orders_items_order_id');
    await queryInterface.removeIndex('orders_items', 'idx_orders_items_product_id');
    await queryInterface.removeIndex('payments', 'idx_payments_order_id');
    await queryInterface.removeIndex('users_roles', 'idx_users_roles_user_id');
    await queryInterface.removeIndex('users_roles', 'idx_users_roles_role_id');
  },
};
