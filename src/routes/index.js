const userRoutes = require('./users.routes');
const rolesRoutes = require('./roles.routes');

const ApiRoutes = (app) => {
  app.use('/api/v1/', userRoutes);
  app.use('/api/v1/', rolesRoutes);
};

module.exports = ApiRoutes;
