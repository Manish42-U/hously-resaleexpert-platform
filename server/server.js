require('dotenv').config()

const initDb = require('./initDb')
const createApp = require('./app')

const PORT = process.env.PORT || 5050
let server

const startServer = async () => {
  await initDb()
  const app = createApp()

  server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log(`API Base URL: http://localhost:${PORT}/api`)
    console.log('Database: Ready')
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  if (!server) {
    process.exit(0)
  }

  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

module.exports = { startServer }
