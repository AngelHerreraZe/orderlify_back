'use strict';
const { Op } = require('sequelize');
const db = require('../database/models/index');

class productsServices {
  // ─── Products ──────────────────────────────────────────────────────────────

  static async createProduct(name, description, price, categoryId, companyId = null) {
    const product = await db.Products.create({ name, description, price, categoryId, companyId });
    return product;
  }

  /**
   * Get products for a branch via branch_products (branch-specific availability
   * and price override).  Falls back to company-wide list when branchId is absent.
   * @param {object} tenant - { companyId, branchId }
   * @param {string|null} since - ISO timestamp; if set, only return products updated after this date
   */
  static async getProducts(tenant = {}, since = null) {
    const { companyId, branchId } = tenant;
    const sinceDate = since ? new Date(since) : null;

    if (branchId) {
      // Return products available at the branch, merging branch price override
      const productWhere = {};
      if (companyId) productWhere.companyId = companyId;
      if (sinceDate)  productWhere.updatedAt = { [Op.gt]: sinceDate };

      const branchProducts = await db.BranchProducts.findAll({
        where: { branchId, available: true },
        include: [
          {
            model: db.Products,
            where: Object.keys(productWhere).length ? productWhere : undefined,
            include: [{ model: db.Categories, attributes: { exclude: ['createdAt', 'updatedAt'] } }],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
        order: [[{ model: db.Products }, 'id', 'ASC']],
      });

      return branchProducts.map((bp) => {
        const p = bp.Product.toJSON();
        // Apply branch price override if set
        if (bp.price !== null && bp.price !== undefined) {
          p.price = bp.price;
        }
        p.branchAvailable = bp.available;
        return p;
      });
    }

    // Fallback: no branchId — return all company products
    const where = {};
    if (companyId) where.companyId = companyId;
    if (sinceDate)  where.updatedAt = { [Op.gt]: sinceDate };

    const products = await db.Products.findAll({
      where,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [{ model: db.Categories, attributes: { exclude: ['createdAt', 'updatedAt'] } }],
      order: [['id', 'ASC']],
    });
    return products;
  }

  static async getProductById(id) {
    const product = await db.Products.findOne({
      where: { id },
      include: [{ model: db.Categories, attributes: { exclude: ['createdAt', 'updatedAt'] } }],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    return product;
  }

  static async updateProduct(id, name, description, price, avaliable, categoryId) {
    await db.Products.update({ name, description, price, avaliable, categoryId }, { where: { id } });
  }

  static async deleteProduct(id) {
    await db.Products.destroy({ where: { id } });
  }

  // ─── Categories ─────────────────────────────────────────────────────────────

  static async getCategories(tenant = {}) {
    const where = {};
    if (tenant.companyId) where.companyId = tenant.companyId;

    const categories = await db.Categories.findAll({
      where,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    return categories;
  }

  static async createCategory(name, companyId = null) {
    await db.Categories.create({ name, companyId });
  }
}

module.exports = productsServices;
