'use strict';
const catchAsync = require('../utils/catchAsync');
const db = require('../database/models/index');

exports.getPublicMenu = catchAsync(async (req, res) => {
  const { branchId } = req.params;

  const branch = await db.Branch.findOne({
    where: { id: branchId, active: true },
    attributes: ['id', 'companyId', 'name', 'address', 'phone', 'menuStyle'],
  });
  if (!branch) return res.status(404).json({ message: 'Branch not found' });

  const branchProducts = await db.BranchProducts.findAll({
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

  const products = branchProducts.map((bp) => {
    const p = bp.Product.toJSON();
    if (bp.price !== null && bp.price !== undefined) p.price = bp.price;
    p.available = bp.available;
    delete p.cost;
    return p;
  });

  const branchData = branch.toJSON();
  delete branchData.companyId;

  return res.json({
    branch: branchData,
    products,
  });
});
