const userRoutes = require('./users.routes');

const ApiRoutes = (app) => {
    app.use('/api/v1/', userRoutes)
};

module.exports = ApiRoutes;
