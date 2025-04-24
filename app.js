const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const ApiRoutes = require('./routes');
const errorHandlerRouter = require('./routes/error.handler.routes');
//const swaggerUi = require("swagger-ui-express");
// const swaggerDoc = require("./swagger.json");

const app = express();

const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in one hour!',
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(xss());
app.use(hpp());

app.use('/api/v1', limiter);


ApiRoutes(app);

errorHandlerRouter(app);

module.exports = app;
