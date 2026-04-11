'use strict';

/**
 * subdomainResolver — middleware de resolución de tenant por subdominio
 *
 * Resuelve la empresa (tenant) a partir del subdominio de la request.
 * Soporta dos fuentes, en orden de prioridad:
 *
 *   1. Header `x-subdomain`  — enviado por el frontend (api.js interceptor)
 *      útil cuando el API vive en un dominio fijo (api.orderlify.net) y el
 *      frontend en subdominio (empresa.orderlify.net).
 *
 *   2. `req.hostname`        — cuando el API también está detrás del wildcard
 *      (empresa.orderlify.net/api/...). Nginx hace el proxy y Express lee el
 *      hostname del Host header (requiere app.set('trust proxy', 1) si hay
 *      reverse proxy).
 *
 * En ambos casos:
 *   - Empresa no encontrada   → 404 JSON
 *   - Empresa suspendida      → 403 JSON
 *   - Empresa cancelada       → 410 JSON (Gone)
 *   - Empresa activa          → req.company = { id, name, subdomain, status }
 *
 * Uso:
 *   app.use('/api/v1/', subdomainResolver)      ← aplica a todas las rutas
 *   router.get('/orders', subdomainResolver, ...)  ← solo a rutas específicas
 *
 * Rutas que deben EXCLUIRSE de este middleware:
 *   GET /tenants/validate  — es el endpoint que valida el subdominio, no
 *                            tiene sentido aplicarlo aquí.
 */

const db        = require('../database/models/index');
const AppError  = require('../utils/appError');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_DOMAIN = (process.env.BASE_DOMAIN ?? 'orderlify.net').toLowerCase();

/**
 * Extrae el subdominio a partir de un hostname completo.
 * "empresa.orderlify.net" → "empresa"
 * "orderlify.net"         → null
 * "localhost"             → null
 * "192.168.1.1"           → null
 */
function extractSubdomain(hostname) {
  if (!hostname) return null;
  const host = hostname.toLowerCase().split(':')[0]; // quitar puerto si lo hay

  // IP → no hay subdominio
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;

  // localhost → no hay subdominio
  if (host === 'localhost') return null;

  // Debe terminar en el base domain
  if (!host.endsWith(`.${BASE_DOMAIN}`)) return null;

  const sub = host.slice(0, -(BASE_DOMAIN.length + 1)); // quitar ".orderlify.net"
  if (!sub || sub === 'www') return null;

  return sub;
}

/**
 * Cache en memoria para evitar hits continuos a la DB por el mismo subdominio.
 * TTL de 60s — suficiente para requests frecuentes, y actualizable para
 * reflejar cambios de estado (suspensión) sin reiniciar el servidor.
 *
 * Formato: Map<subdomain, { company|null, resolvedAt: Date }>
 */
const CACHE_TTL_MS = 60_000;
const tenantCache  = new Map();

async function lookupTenant(subdomain) {
  const cached = tenantCache.get(subdomain);
  if (cached && Date.now() - cached.resolvedAt < CACHE_TTL_MS) {
    return cached.company;
  }

  const company = await db.Company.findOne({
    where:      { subdomain: subdomain.toLowerCase() },
    attributes: ['id', 'name', 'subdomain', 'status'],
  });

  tenantCache.set(subdomain, { company, resolvedAt: Date.now() });
  return company;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Middleware principal. Resuelve el tenant e inyecta req.company.
 * Retorna error si el subdomain no existe o la empresa está inactiva.
 */
const subdomainResolver = async (req, _res, next) => {
  // 1. Obtener el subdominio
  const subdomain =
    (req.headers['x-subdomain'] ?? '').trim().toLowerCase() ||  // desde header
    extractSubdomain(req.hostname);                              // desde Host header

  if (!subdomain) {
    // Sin subdominio → request desde base domain o localhost sin contexto.
    // Pasamos sin inyectar req.company; los controllers que lo necesiten
    // deberán manejarlo.
    req.company = null;
    return next();
  }

  try {
    const company = await lookupTenant(subdomain);

    if (!company) {
      return next(new AppError('Empresa no encontrada', 404));
    }

    if (company.status === 'suspended') {
      return next(new AppError('Esta empresa está suspendida. Contacte a soporte.', 403));
    }

    if (company.status === 'canceled') {
      return next(new AppError('Esta empresa fue cancelada y ya no está disponible.', 410));
    }

    // Empresa activa → inyectar en la request
    req.company = {
      id:        company.id,
      name:      company.name,
      subdomain: company.subdomain,
      status:    company.status,
    };

    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Variante estricta: exige que req.company esté presente.
 * Úsala en rutas donde el subdominio es OBLIGATORIO (ej: todas las rutas
 * de negocio excepto /tenants/validate y /health).
 */
const requireCompany = (req, _res, next) => {
  if (!req.company) {
    return next(new AppError('Subdominio de empresa requerido', 400));
  }
  return next();
};

/**
 * Invalida manualmente la entrada de caché para un subdominio.
 * Llamar desde el controlador cuando se suspende/cancela una empresa
 * para que el cambio sea inmediato sin esperar el TTL.
 *
 * Ejemplo:
 *   const { invalidateTenantCache } = require('../middlewares/subdomainResolver.middleware');
 *   invalidateTenantCache('tacos-el-patron');
 */
const invalidateTenantCache = (subdomain) => {
  if (subdomain) tenantCache.delete(subdomain.toLowerCase());
};

module.exports = { subdomainResolver, requireCompany, invalidateTenantCache };
