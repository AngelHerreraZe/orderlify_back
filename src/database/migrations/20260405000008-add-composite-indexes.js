'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // orders: filtros más frecuentes en queries operacionales
    await queryInterface.addIndex('orders', ['company_id', 'branch_id'], {
      name: 'idx_orders_company_branch',
    });
    await queryInterface.addIndex('orders', ['company_id', 'status'], {
      name: 'idx_orders_company_status',
    });
    await queryInterface.addIndex('orders', ['company_id', 'createdAt'], {
      name: 'idx_orders_company_date',
    });

    // user: búsqueda de username dentro de una empresa (login multi-tenant)
    await queryInterface.addIndex('user', ['company_id', 'username'], {
      name: 'idx_users_company_username',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('orders', 'idx_orders_company_branch');
    await queryInterface.removeIndex('orders', 'idx_orders_company_status');
    await queryInterface.removeIndex('orders', 'idx_orders_company_date');
    await queryInterface.removeIndex('user', 'idx_users_company_username');
  },
};
