const db = require('../database/models/index');

class productsServices {
  static async createProduct(name, description, price, categoryId) {
    try {
      await db.Products.create({ name, description, price, categoryId });
    } catch (error) {
      throw error;
    }
  }

  static async getProducts() {
    try {
      const products = await db.Products.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        include: [{ all: true }],
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
        include: [{ all: true }],
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      });
      return product;
    } catch (error) {
      throw error;
    }
  }

  static async updateProduct(
    id,
    name,
    description,
    price,
    avaliable,
    categoryId
  ) {
    try {
      await db.Products.update(
        {
          name,
          description,
          price,
          avaliable,
          categoryId,
        },
        {
          where: { id },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(id) {
    try {
      await db.Products.destroy({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getCategories() {
    try {
      const categories = await db.Categories.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        include: [{ all: true }],
      });
      return categories;
    } catch (error) {
      throw error;
    }
  }

  static async createCategory(name) {
    try {
      await db.Categories.create({
        name,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = productsServices;
