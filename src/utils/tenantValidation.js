'use strict';
const db = require('../database/models/index');
const AppError = require('./appError');

/**
 * Verifica que un branch_id pertenece a la empresa del token.
 * Lanzar si el branch no existe o pertenece a otra empresa.
 *
 * Uso en controllers que reciben branchId de header/body:
 *   await validateBranchOwnership(req.tenant.branchId, req.tenant.companyId, next);
 */
const validateBranchOwnership = async (branchId, companyId) => {
  if (!branchId) return null;

  const branch = await db.Branch.findOne({
    where: { id: branchId, companyId },
    attributes: ['id', 'name', 'active'],
  });

  if (!branch) {
    throw new AppError('Sucursal no encontrada o no pertenece a esta empresa', 403);
  }

  return branch;
};

/**
 * Verifica que una station_id pertenece a un branch de la empresa del token.
 * Útil para requests que especifican estación de trabajo.
 */
const validateStationOwnership = async (stationId, companyId) => {
  if (!stationId) return null;

  const station = await db.Station.findOne({
    where: { id: stationId },
    include: [{
      model: db.Branch,
      as: 'branch',
      where: { companyId },
      attributes: ['id', 'companyId'],
    }],
    attributes: ['id', 'name', 'active'],
  });

  if (!station) {
    throw new AppError('Estación no encontrada o no pertenece a esta empresa', 403);
  }

  return station;
};

/**
 * Inyecta los filtros de tenant obligatorios en un objeto where de Sequelize.
 * Siempre incluye companyId; incluye branchId solo si está presente en tenant.
 *
 * Uso:
 *   const where = tenantWhere(req.tenant, { status: 'Pendiente' });
 *   const orders = await Order.findAll({ where });
 */
const tenantWhere = (tenant, extra = {}) => {
  if (!tenant?.companyId) {
    throw new AppError('Contexto de empresa requerido', 400);
  }

  return {
    companyId: tenant.companyId,
    ...(tenant.branchId && { branchId: tenant.branchId }),
    ...extra,
  };
};

module.exports = { validateBranchOwnership, validateStationOwnership, tenantWhere };
