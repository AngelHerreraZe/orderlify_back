'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('orders_items');

    // Remove removed_ingredients if it still exists
    if (tableDesc.removed_ingredients) {
      await queryInterface.removeColumn('orders_items', 'removed_ingredients');
    }

    // Add notes only if it doesn't already exist
    if (!tableDesc.notes) {
      await queryInterface.addColumn('orders_items', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('orders_items');

    if (tableDesc.notes) {
      await queryInterface.removeColumn('orders_items', 'notes');
    }

    if (!tableDesc.removed_ingredients) {
      await queryInterface.addColumn('orders_items', 'removed_ingredients', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
