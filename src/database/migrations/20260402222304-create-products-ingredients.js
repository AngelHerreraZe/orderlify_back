'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products_ingredients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      productId: {
        type: Sequelize.INTEGER,
        field: 'product_id',
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      ingredientId: {
        type: Sequelize.INTEGER,
        field: 'ingredient_id',
        allowNull: false,
        references: { model: 'ingredients', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      quantity: {
        // cantidad del ingrediente requerida para 1 porción del producto
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      // Override por orden: si el cliente pide "sin cebolla" se guarda aquí
      overrideQuantity: {
        type: Sequelize.FLOAT,
        field: 'override_quantity',
        allowNull: true,
        defaultValue: null,
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products_ingredients');
  },
};