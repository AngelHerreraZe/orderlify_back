'use strict';
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Tenant context middleware.
 *
 * companyId → extraído del JWT (seguro, no spoofable).
 *   El frontend NO necesita enviar x-company-id.
 *
 * branchId / stationId → headers opcionales (x-branch-id, x-station-id).
 *   El usuario puede cambiar de sucursal en la misma sesión, por eso
 *   viajan en header. Se valida en controller que branch pertenece a la
 *   empresa del token (ver utils/tenantValidation.js).
 *
 * Si no hay token (ruta pública como /login), req.tenant = null.
 */
const extractTenant = (req, _res, next) => {
  const token = req.headers['auth-token'];

  if (!token) {
    req.tenant = null;
    return next();
  }

  try {
    // No re-verificamos la firma aquí — authenticate() ya lo hizo.
    // Solo decodificamos para extraer companyId sin overhead extra.
    const decoded = jwt.decode(token);

    req.tenant = {
      companyId:  decoded?.companyId ?? null, // del JWT, nunca del header
      branchId:   parseInt(req.headers['x-branch-id'],   10) || null,
      stationId:  parseInt(req.headers['x-station-id'],  10) || null,
    };
  } catch {
    req.tenant = null;
  }

  next();
};

module.exports = { extractTenant };
