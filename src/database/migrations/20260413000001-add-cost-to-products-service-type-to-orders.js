'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'cost', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });

    // In PostgreSQL, ENUM types must be created explicitly before use in addColumn.
    await queryInterface.sequelize.query(
      `DO $$ BEGIN
         CREATE TYPE "enum_orders_service_type" AS ENUM ('mesa', 'pickup', 'delivery');
       EXCEPTION WHEN duplicate_object THEN null;
       END $$;`
    );

    await queryInterface.addColumn('orders', 'service_type', {
      type: '"enum_orders_service_type"',
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'cost');
    await queryInterface.removeColumn('orders', 'service_type');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_service_type";'
    );
  },
};
