const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const sanitize = require('./middlewares/sanitize.middleware');
const { extractTenant } = require('./middlewares/tenant.middleware');
const {
  subdomainResolver,
} = require('./middlewares/subdomainResolver.middleware');

const ApiRoutes = require('./routes');
const errorHandlerRouter = require('./routes/error.handler.routes');

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

const app = express();

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in one hour!',
  standardHeaders: true,
  legacyHeaders: false,
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* =========================
   🔐 CORS (FIX REAL)
========================= */
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origin === 'null') return cb(null, true);

      try {
        const url = new URL(origin);
        const hostname = url.hostname;

        // Permitir dominio raíz
        if (hostname === 'orderlify.net') return cb(null, true);

        // Permitir TODOS los subdominios reales
        if (hostname.endsWith('.orderlify.net')) return cb(null, true);

        return cb(new Error(`CORS: origin '${origin}' not allowed`));
      } catch (err) {
        return cb(new Error(`CORS: invalid origin '${origin}'`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'auth-token',
      'x-company-id',
      'x-branch-id',
      'x-station-id',
      'x-subdomain',
    ],
  }),
);

/* =========================
   🛡 Seguridad base
========================= */
app.use(helmet());
app.use(express.json());
app.use(sanitize);
app.use(hpp());

/* =========================
   📚 Docs
========================= */
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

/* =========================
   ❤️ Health check
========================= */
app.get('/api/v1/health', (_req, res) =>
  res.json({ status: 'ok', ts: Date.now() }),
);

/* =========================
   🚨 TENANT VALIDATION GLOBAL (FIX CLAVE)
========================= */
app.use(async (req, res, next) => {
  try {
    const PUBLIC_PATHS = [
      '/api/v1/health',
      '/api/v1/tenants/validate',
      '/api/v1/docs',
    ];

    if (PUBLIC_PATHS.some((p) => req.path.startsWith(p))) {
      return next();
    }

    // 🔥 FIX VERCEL
    const host = req.headers['x-forwarded-host'] || req.headers.host;

    if (!host) {
      return res.status(400).json({ error: 'Host inválido' });
    }

    const subdomain = host.split('.')[0];

    // Evitar root domain
    if (subdomain === 'orderlify') {
      return next();
    }

    // 🔥 usar tu resolver existente
    req.headers['x-subdomain'] = subdomain;

    // Ejecutar tu lógica real
    await new Promise((resolve, reject) => {
      subdomainResolver(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 🔥 VALIDACIÓN REAL
    if (!req.company) {
      return res.status(404).json({
        error: 'Empresa no encontrada',
        subdomain,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
});

/* =========================
   🚦 Rate limiter
========================= */
app.use('/api/v1/', (req, res, next) => {
  if (req.path === '/health') return next();
  limiter(req, res, next);
});

/* =========================
   🧠 Tenant context
========================= */
app.use('/api/v1/', extractTenant);

/* =========================
   🚀 Routes
========================= */
ApiRoutes(app);

/* =========================
   ❌ 404 GLOBAL (IMPORTANTE)
========================= */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/* =========================
   💥 Error handler
========================= */
errorHandlerRouter(app);

module.exports = app;
