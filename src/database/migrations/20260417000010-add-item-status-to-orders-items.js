'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders_items', 'item_status', {
      type: Sequelize.ENUM('Pendiente', 'Preparando', 'Listo'),
      allowNull: false,
      defaultValue: 'Pendiente',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders_items', 'item_status');
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS \"enum_orders_items_item_status\";"
    );
  },
};
