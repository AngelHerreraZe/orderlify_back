'use strict';
const { Op } = require('sequelize');
const db = require('../database/models/index');

class CashRegisterServices {
  /**
   * Returns the current open shift for the tenant, or null if none.
   */
  static async getCurrentShift(tenant = {}) {
    const where = { status: 'open' };
    if (tenant.companyId) where.companyId = tenant.companyId;
    if (tenant.branchId)  where.branchId  = tenant.branchId;

    return db.CashRegister.findOne({
      where,
      include: [{ model: db.User, as: 'opener', attributes: ['id', 'name', 'lastname'] }],
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
      companyId:      tenant.companyId ?? null,
      branchId:       tenant.branchId  ?? null,
    });
    return shift.toJSON();
  }

  /**
   * Computes total cash received since the shift opened (method = Efectivo).
   */
  static async computeCashReceived(shift, tenant = {}) {
    const where = {
      method:  'Efectivo',
      paidAt:  { [Op.gte]: shift.openedAt },
    };
    if (tenant.companyId) where.companyId = tenant.companyId;
    if (tenant.branchId)  where.branchId  = tenant.branchId;

    const payments = await db.Payments.findAll({ where });
    return payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  }

  /**
   * Closes the current open shift with an actual closing balance.
   */
  static async closeShift(shiftId, closingBalance, notes, tenant = {}) {
    const shift = await db.CashRegister.findByPk(shiftId);
    if (!shift || shift.status !== 'open') throw new Error('No se encontró una caja abierta con ese ID');

    const totalCashReceived = await this.computeCashReceived(shift, tenant);
    const expectedBalance   = (shift.openingBalance || 0) + totalCashReceived;
    const difference        = parseFloat(closingBalance) - expectedBalance;

    await shift.update({
      closedAt:           new Date(),
      closingBalance:     parseFloat(closingBalance),
      totalCashReceived,
      expectedBalance,
      difference,
      notes:              notes ?? null,
      status:             'closed',
    });

    return shift.toJSON();
  }

  /**
   * Lists past shifts (closed), newest first, with limit.
   */
  static async listShifts(tenant = {}, limit = 20) {
    const where = { status: 'closed' };
    if (tenant.companyId) where.companyId = tenant.companyId;
    if (tenant.branchId)  where.branchId  = tenant.branchId;

    return db.CashRegister.findAll({
      where,
      include: [{ model: db.User, as: 'opener', attributes: ['id', 'name', 'lastname'] }],
      order: [['openedAt', 'DESC']],
      limit,
    });
  }
}

module.exports = CashRegisterServices;
