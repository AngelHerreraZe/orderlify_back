const userRoutes = require('./users.routes');
const rolesRoutes = require('./roles.routes');
const productsRoutes = require('./products.routes');
const tablesRoutes = require('./tables.routes');
const ordersRoutes = require('./orders.routes');
const paymentsRoutes = require('./payments.route');

const ApiRoutes = (app) => {
  app.use('/api/v1/', userRoutes);
  app.use('/api/v1/', rolesRoutes);
  app.use('/api/v1/', productsRoutes);
  app.use('/api/v1/', tablesRoutes);
  app.use('/api/v1/', ordersRoutes);
  app.use('/api/v1/', paymentsRoutes);
};

module.exports = ApiRoutes;
