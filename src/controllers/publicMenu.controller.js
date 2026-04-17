'use strict';
const catchAsync = require('../utils/catchAsync');
const db = require('../database/models/index');

exports.getPublicMenu = catchAsync(async (req, res) => {
  const { branchId } = req.params;

  const branch = await db.Branch.findOne({
    where: { id: branchId, active: true },
    attributes: ['id', 'companyId', 'name', 'address', 'phone', 'menuStyle'],
    include: [{ model: db.Company, as: 'company', attributes: ['name'] }],
  });
  if (!branch) return res.status(404).json({ message: 'Branch not found' });

  // 1. Intentar con branch_products (productos asignados específicamente a la sucursal)
  const branchProductRows = await db.BranchProducts.findAll({
    where: { branchId, available: true },
    include: [
      {
        model: db.Products,
        where: { companyId: branch.companyId },
        include: [{ model: db.Categories, attributes: ['id', 'name'] }],
        attributes: { exclude: ['createdAt', 'updatedAt', 'cost'] },
      },
    ],
    order: [[{ model: db.Products }, 'id', 'ASC']],
  });

  let products;

  if (branchProductRows.length > 0) {
    // Usar productos de la sucursal con precio override si aplica
    products = branchProductRows.map((bp) => {
      const p = bp.Product.toJSON();
      if (bp.price !== null && bp.price !== undefined) p.price = bp.price;
      p.available = bp.available;
      delete p.cost;
      return p;
    });
  } else {
    // Fallback: devolver todos los productos activos de la compañía
    const allProducts = await db.Products.findAll({
      where: { companyId: branch.companyId },
      include: [{ model: db.Categories, attributes: ['id', 'name'] }],
      attributes: { exclude: ['createdAt', 'updatedAt', 'cost'] },
      order: [['id', 'ASC']],
    });
    products = allProducts.map((p) => {
      const data = p.toJSON();
      delete data.cost;
      return data;
    });
  }

  const branchData = branch.toJSON();
  const companyName = branchData.company?.name ?? null;
  delete branchData.companyId;
  delete branchData.company;

  return res.json({
    branch: { ...branchData, companyName },
    products,
  });
});
