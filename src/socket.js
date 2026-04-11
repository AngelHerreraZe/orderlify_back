'use strict';

const { Server }  = require('socket.io');
const jwt         = require('jsonwebtoken');
const db          = require('./database/models/index');

let io;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_DOMAIN = (process.env.BASE_DOMAIN ?? 'orderlify.net').toLowerCase();

/**
 * Extrae el subdominio del Origin o Referer del handshake.
 * También acepta el campo `subdomain` que el cliente puede enviar
 * en socket.io `auth` o `query`.
 *
 * Prioridad:
 *   1. handshake.auth.subdomain       (explícito, más seguro)
 *   2. handshake.query.subdomain      (query string del cliente)
 *   3. parseado del Origin header     (automático)
 */
function resolveSubdomainFromHandshake(handshake) {
  // 1 y 2 — enviado explícitamente por el cliente
  const explicit =
    (handshake.auth?.subdomain ?? '').trim().toLowerCase() ||
    (handshake.query?.subdomain ?? '').trim().toLowerCase();

  if (explicit) return explicit;

  // 3 — parsear desde el Origin del navegador
  const origin = handshake.headers?.origin ?? '';
  try {
    const url      = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    if (!hostname.endsWith(`.${BASE_DOMAIN}`)) return null;

    const sub = hostname.slice(0, -(BASE_DOMAIN.length + 1));
    return sub && sub !== 'www' ? sub : null;
  } catch {
    return null;
  }
}

// ─── initSocket ───────────────────────────────────────────────────────────────

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // Electron / server-side

        const patterns = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);

        const isAllowed = patterns.some((pattern) => {
          if (pattern.includes('*')) {
            const re = pattern
              .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
              .replace(/\*/g, '.+');
            return new RegExp(`^${re}$`).test(origin);
          }
          return pattern === origin;
        });

        return isAllowed ? cb(null, true) : cb(new Error(`Socket CORS: origen no permitido — ${origin}`));
      },
      methods:     ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── Middleware 1: Validación de tenant en el handshake ─────────────────────
  // Corre UNA vez por conexión, antes de `connection`.
  // Rechaza conexiones de subdominios inválidos o empresas inactivas.
  io.use(async (socket, next) => {
    const subdomain = resolveSubdomainFromHandshake(socket.handshake);

    if (!subdomain) {
      // Sin subdominio → puede ser el panel admin o localhost.
      // Permitimos la conexión pero sin contexto de tenant.
      socket.data.company = null;
      return next();
    }

    try {
      const company = await db.Company.findOne({
        where:      { subdomain },
        attributes: ['id', 'name', 'subdomain', 'status'],
      });

      if (!company) {
        return next(new Error('TENANT_NOT_FOUND'));
      }

      if (company.status !== 'active') {
        return next(new Error(`TENANT_INACTIVE:${company.status}`));
      }

      socket.data.company = {
        id:        company.id,
        name:      company.name,
        subdomain: company.subdomain,
      };

      return next();
    } catch (err) {
      console.error('[Socket] Error validando tenant:', err.message);
      return next(new Error('TENANT_RESOLUTION_ERROR'));
    }
  });

  // ── Middleware 2: Autenticación JWT (opcional por socket) ──────────────────
  // El cliente puede enviar el token en socket.io `auth`:
  //   socket = io(URL, { auth: { token: localStorage.getItem('auth-token') } })
  //
  // Si no hay token, la conexión sigue (permite canales públicos como cocina
  // en modo display sin login). Protege eventos individuales con requireAuth.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ?? socket.handshake.query?.token;
    if (!token) return next(); // sin auth — socket público

    try {
      const decoded = jwt.verify(token, process.env.SECRETWORD, {
        algorithms: ['HS512'],
      });

      // Validar que el companyId del token coincide con el tenant del socket
      const company = socket.data.company;
      if (company && decoded.companyId !== company.id) {
        return next(new Error('TOKEN_COMPANY_MISMATCH'));
      }

      socket.data.user = {
        id:        decoded.id,
        username:  decoded.username,
        companyId: decoded.companyId,
      };

      return next();
    } catch {
      return next(new Error('TOKEN_INVALID'));
    }
  });

  // ── Conexión establecida ───────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const company = socket.data.company;
    const user    = socket.data.user;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Socket] Conectado: ${socket.id} | tenant: ${company?.subdomain ?? 'none'} | user: ${user?.username ?? 'anon'}`);
    }

    // Unirse al room del tenant automáticamente — todos los eventos
    // emitidos con getIO().to(`tenant:${companyId}`) llegan solo a
    // los sockets de esa empresa.
    if (company?.id) {
      socket.join(`tenant:${company.id}`);
    }

    // Join role-based room (e.g. 'Admin', 'Mesero')
    socket.on('join:role', (role) => {
      socket.join(role);
    });

    // Join branch-scoped room (e.g. 'branch:3')
    socket.on('join:branch', (branchId) => {
      if (branchId) socket.join(`branch:${branchId}`);
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Socket] Desconectado: ${socket.id}`);
      }
    });
  });
};

// ─── Getters ──────────────────────────────────────────────────────────────────

/** Importar en controllers para emitir eventos */
const getIO = () => io ?? null;

/**
 * Emite un evento solo a los sockets del tenant indicado.
 *
 * @param {number} companyId
 * @param {string} event
 * @param {*}      payload
 *
 * Ejemplo en un controller:
 *   const { emitToTenant } = require('../socket')
 *   emitToTenant(req.company.id, 'order:new', { orderId: 42 })
 */
const emitToTenant = (companyId, event, payload) => {
  if (!io || !companyId) return;
  io.to(`tenant:${companyId}`).emit(event, payload);
};

module.exports = { initSocket, getIO, emitToTenant };
