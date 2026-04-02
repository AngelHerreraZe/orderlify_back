require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');

const port = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server);

server.listen(port, () => {
  console.log(`App Running On port ${port}`);
});