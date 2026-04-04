'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders_items', 'removed_ingredients', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: 'JSON array de nombres de ingredientes a omitir',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('orders_items', 'removed_ingredients');
  },
};
