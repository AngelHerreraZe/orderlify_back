const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sanitize              = require('./middlewares/sanitize.middleware');
const { extractTenant }     = require('./middlewares/tenant.middleware');
const ApiRoutes             = require('./routes');
const errorHandlerRouter    = require('./routes/error.handler.routes');
const swaggerUi             = require('swagger-ui-express');
const swaggerDoc            = require('./swagger.json');

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

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    // Allow web origins from env, plus Electron renderer (origin === 'null')
    origin: (origin, cb) => {
      const allowed = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((o) => o.trim());
      if (!origin || origin === 'null' || allowed.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'));
      }
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

// Inject tenant context (companyId, branchId, stationId) on every request
app.use('/api/v1/', extractTenant);

ApiRoutes(app);
errorHandlerRouter(app);

module.exports = app;
