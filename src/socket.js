const { Server } = require('socket.io')

let io

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`)

    // El cliente anuncia a qué sala pertenece según su rol
    socket.on('join:role', (role) => {
      socket.join(role)
    })

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`)
    })
  })
}

// Esta función la importan los controllers para emitir eventos
const getIO = () => {
  if (!io) throw new Error('Socket.io no inicializado')
  return io
}

module.exports = { initSocket, getIO }