const db = require('../database/models/index');

class productsServices {
  // ─── Products ────────────────────────────────────────────────────────────────

  static async createProduct(name, description, price, categoryId, ingredientIds = []) {
    try {
      const product = await db.Products.create({ name, description, price, categoryId });
      if (ingredientIds.length > 0) {
        await product.setIngredients(ingredientIds);
      }
      return product;
    } catch (error) {
      throw error;
    }
  }

  static async getProducts() {
    try {
      const products = await db.Products.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          { model: db.Categories, attributes: { exclude: ['createdAt', 'updatedAt'] } },
          {
            model: db.Ingredients,
            as: 'ingredients',
            attributes: ['id', 'name'],
            through: { attributes: [] },
          },
        ],
        order: [['id', 'ASC']],
      });
      return products;
    } catch (error) {
      throw error;
    }
  }

  static async getProductById(id) {
    try {
      const product = await db.Products.findOne({
        where: { id },
        include: [
          { model: db.Categories, attributes: { exclude: ['createdAt', 'updatedAt'] } },
          {
            model: db.Ingredients,
            as: 'ingredients',
            attributes: ['id', 'name'],
            through: { attributes: [] },
          },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
      return product;
    } catch (error) {
      throw error;
    }
  }

  static async updateProduct(id, name, description, price, avaliable, categoryId, ingredientIds) {
    try {
      await db.Products.update(
        { name, description, price, avaliable, categoryId },
        { where: { id } }
      );
      if (ingredientIds !== undefined) {
        const product = await db.Products.findByPk(id);
        if (product) await product.setIngredients(ingredientIds);
      }
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(id) {
    try {
      await db.Products.destroy({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  // ─── Categories ───────────────────────────────────────────────────────────────

  static async getCategories() {
    try {
      const categories = await db.Categories.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
      return categories;
    } catch (error) {
      throw error;
    }
  }

  static async createCategory(name) {
    try {
      await db.Categories.create({ name });
    } catch (error) {
      throw error;
    }
  }

  // ─── Ingredients ─────────────────────────────────────────────────────────────

  static async getAllIngredients() {
    try {
      const ingredients = await db.Ingredients.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      });
      return ingredients;
    } catch (error) {
      throw error;
    }
  }

  static async createIngredient(name) {
    try {
      const ingredient = await db.Ingredients.create({ name });
      return ingredient;
    } catch (error) {
      throw error;
    }
  }

  static async deleteIngredient(id) {
    try {
      await db.Ingredients.destroy({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = productsServices;
