const userRoutes = require('./users.routes');
const rolesRoutes = require('./roles.routes');
const productsRoutes = require('./products.routes');

const ApiRoutes = (app) => {
  app.use('/api/v1/', userRoutes);
  app.use('/api/v1/', rolesRoutes);
  app.use('/api/v1/', productsRoutes)
};

module.exports = ApiRoutes;
