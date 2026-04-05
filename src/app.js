const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const sanitize              = require('./middlewares/sanitize.middleware');
const { extractTenant }     = require('./middlewares/tenant.middleware');
const ApiRoutes             = require('./routes');
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

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'auth-token', 'x-company-id', 'x-branch-id', 'x-station-id'],
  }),
);
app.use(sanitize);
app.use(hpp());

app.use('/api/v1/', limiter);

// Inject tenant context (companyId, branchId, stationId) from headers on every request
app.use('/api/v1/', extractTenant);

ApiRoutes(app);
errorHandlerRouter(app);

module.exports = app;
