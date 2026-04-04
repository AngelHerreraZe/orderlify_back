const db = require('../database/models/index');

class IngredientsServices {
  static async getAll() {
    return db.Ingredients.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order: [['name', 'ASC']],
    });
  }

  static async create(name) {
    return db.Ingredients.create({ name });
  }

  static async delete(id) {
    return db.Ingredients.destroy({ where: { id } });
  }

  /**
   * Reemplaza los ingredientes asociados a un producto.
   * @param {number} productId
   * @param {number[]} ingredientIds - array de IDs de ingredientes
   */
  static async syncProductIngredients(productId, ingredientIds) {
    const product = await db.Products.findByPk(productId);
    if (!product) throw new Error('Product not found');
    await product.setIngredients(ingredientIds);
  }

  static async getByProduct(productId) {
    const product = await db.Products.findByPk(productId, {
      include: [{ model: db.Ingredients, as: 'ingredients', attributes: ['id', 'name'] }],
    });
    if (!product) return [];
    return product.ingredients;
  }
}

module.exports = IngredientsServices;
