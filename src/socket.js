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

    // Join role-based room (e.g. 'Admin', 'Mesero')
    socket.on('join:role', (role) => {
      socket.join(role)
    })

    // Join branch-scoped room (e.g. 'branch:3')
    // Controllers emit to this room for branch-filtered real-time events
    socket.on('join:branch', (branchId) => {
      if (branchId) socket.join(`branch:${branchId}`)
    })

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`)
    })
  })
}

// Esta función la importan los controllers para emitir eventos
const getIO = () => io ?? null

module.exports = { initSocket, getIO }