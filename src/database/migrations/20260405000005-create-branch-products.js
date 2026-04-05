'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('branch_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      branchId: {
        type: Sequelize.INTEGER,
        field: 'branch_id',
        allowNull: false,
        references: { model: 'branches', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        field: 'product_id',
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      // Branch-specific price override (null = use base product price)
      price: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('branch_products', ['branch_id', 'product_id'], {
      unique: true,
      name: 'branch_products_unique_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('branch_products');
  },
};
