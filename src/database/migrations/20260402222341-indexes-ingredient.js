'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('products_ingredients', ['product_id'],    { name: 'idx_pi_product_id' });
    await queryInterface.addIndex('products_ingredients', ['ingredient_id'], { name: 'idx_pi_ingredient_id' });
    await queryInterface.addIndex('ingredients',          ['name'],           { name: 'idx_ingredients_name' });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('products_ingredients', 'idx_pi_product_id');
    await queryInterface.removeIndex('products_ingredients', 'idx_pi_ingredient_id');
    await queryInterface.removeIndex('ingredients',          'idx_ingredients_name');
  },
};