'use strict';
const { Op } = require('sequelize');
const db = require('../database/models/index');

/**
 * Builds the CashRegister WHERE clause + optional Branch include for tenant isolation.
 * - branchId present  → filter directly on cash_registers.branch_id (fast)
 * - only companyId    → join branches to scope by company (3NF-safe)
 */
function buildTenantScope(tenant = {}) {
  const where   = {};
  const include = [];

  if (tenant.branchId) {
    where.branchId = tenant.branchId;
  } else if (tenant.companyId) {
    include.push({
      model:      db.Branch,
      as:         'branch',
      where:      { companyId: tenant.companyId },
      required:   true,
      attributes: [],
    });
  }

  return { where, include };
}

class CashRegisterServices {
  /**
   * Returns the current open shift for the tenant, or null if none.
   */
  static async getCurrentShift(tenant = {}) {
    const { where, include } = buildTenantScope(tenant);
    where.status = 'open';

    return db.CashRegister.findOne({
      where,
      include: [
        ...include,
        { model: db.User, as: 'opener', attributes: ['id', 'name', 'lastname'] },
      ],
      order: [['openedAt', 'DESC']],
    });
  }

  /**
   * Opens a new shift. Fails if there is already one open.
   */
  static async openShift(openingBalance, userId, tenant = {}) {
    const existing = await this.getCurrentShift(tenant);
    if (existing) throw new Error('Ya hay una caja abierta para esta sucursal');

    const shift = await db.CashRegister.create({
      openedAt:       new Date(),
      openingBalance: parseFloat(openingBalance) || 0,
      status:         'open',
      openedBy:       userId ?? null,
      branchId:       tenant.branchId ?? null,
    });
    return shift.toJSON();
  }

  /**
   * Computes total cash received since the shift opened (method = Efectivo).
   * Tenant filtering goes through Orders (payments no longer store tenant columns).
   */
  static async computeCashReceived(shift, tenant = {}) {
    const orderWhere = {};
    if (tenant.companyId) orderWhere.companyId = tenant.companyId;
    if (tenant.branchId)  orderWhere.branchId  = tenant.branchId;

    const hasFilter = Object.keys(orderWhere).length > 0;

    const payments = await db.Payments.findAll({
      where: {
        method: 'Efectivo',
        paidAt: { [Op.gte]: shift.openedAt },
      },
      include: [{
        model:      db.Orders,
        attributes: [],
        where:      hasFilter ? orderWhere : undefined,
        required:   hasFilter,
      }],
    });

    return payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  }

  /**
   * Closes the current open shift with an actual closing balance.
   */
  static async closeShift(shiftId, closingBalance, notes, tenant = {}) {
    const shift = await db.CashRegister.findByPk(shiftId);
    if (!shift || shift.status !== 'open') {
      throw new Error('No se encontró una caja abierta con ese ID');
    }

    const totalCashReceived = await this.computeCashReceived(shift, tenant);
    const expectedBalance   = (shift.openingBalance || 0) + totalCashReceived;
    const difference        = parseFloat(closingBalance) - expectedBalance;

    await shift.update({
      closedAt:       new Date(),
      closingBalance: parseFloat(closingBalance),
      totalCashReceived,
      expectedBalance,
      difference,
      notes:          notes ?? null,
      status:         'closed',
    });

    return shift.toJSON();
  }

  /**
   * Lists past (closed) shifts, newest first.
   */
  static async listShifts(tenant = {}, limit = 20) {
    const { where, include } = buildTenantScope(tenant);
    where.status = 'closed';

    return db.CashRegister.findAll({
      where,
      include: [
        ...include,
        { model: db.User, as: 'opener', attributes: ['id', 'name', 'lastname'] },
      ],
      order: [['openedAt', 'DESC']],
      limit,
    });
  }
}

module.exports = CashRegisterServices;
