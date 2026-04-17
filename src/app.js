const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sanitize              = require('./middlewares/sanitize.middleware');
const { extractTenant }     = require('./middlewares/tenant.middleware');
const { subdomainResolver } = require('./middlewares/subdomainResolver.middleware');
const ApiRoutes             = require('./routes');
const errorHandlerRouter    = require('./routes/error.handler.routes');
const swaggerUi             = require('swagger-ui-express');
const swaggerDoc            = require('./swagger.json');

const app = express();

// Trust the first proxy hop (Render, nginx, etc.) so express-rate-limit
// and req.ip read the real client IP from X-Forwarded-For correctly.
app.set('trust proxy', 1);

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

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    // Allow web origins from env, plus Electron renderer (origin === 'null').
    // ALLOWED_ORIGINS supports exact matches and wildcard patterns like
    // "*.orderlify.net" so that every tenant subdomain is accepted.
    origin: (origin, cb) => {
      if (!origin || origin === 'null') return cb(null, true);

      const patterns = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

      const isAllowed = patterns.some((pattern) => {
        // Wildcard pattern: "https://*.orderlify.net"
        if (pattern.includes('*')) {
          const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.+');
          return new RegExp(`^${escaped}$`).test(origin);
        }
        return pattern === origin;
      });

      if (isAllowed) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type', 'auth-token',
      'x-company-id', 'x-branch-id', 'x-station-id', 'x-subdomain',
    ],
  }),
);
app.use(sanitize);
app.use(hpp());

// ─── Health check (before rate limiter — used by Electron sync engine) ───────
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ─── Rate limiter (skip /health) ──────────────────────────────────────────────
app.use('/api/v1/', (req, res, next) => {
  if (req.path === '/health') return next();
  limiter(req, res, next);
});

// Resolve tenant from subdomain (x-subdomain header or Host) → req.company
// Excluye /tenants/validate y /health que son públicos y no necesitan contexto.
app.use('/api/v1/', (req, res, next) => {
  const PUBLIC_PATHS = [
    '/health',
    '/tenants/validate',
    '/companies/register',
    '/payments/create-payment-intent',
    '/payments/stripe/create-subscription',
    '/payments/paypal/plan-id',
    '/payments/paypal/verify-subscription',
  ];
  if (PUBLIC_PATHS.some((p) => req.path.startsWith(p))) return next();
  subdomainResolver(req, res, next);
});

// Inject tenant context (companyId, branchId, stationId) on every request
app.use('/api/v1/', extractTenant);

ApiRoutes(app);
errorHandlerRouter(app);

module.exports = app;
