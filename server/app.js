const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const propertyRoutes = require('./routes/propertyRoutes')
const blogRoutes = require('./routes/blogRoutes')
const contactRoutes = require('./routes/contactRoutes')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const whatsappRoutes = require('./routes/whatsappRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const cmsRoutes = require('./routes/cmsRoutes')
const AppSettingsService = require('./services/AppSettingsService')
const asyncHandler = require('./middleware/asyncHandler')
const maintenanceMode = require('./middleware/maintenanceMode')
const requestContext = require('./middleware/requestContext')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

const createApp = () => {
  const app = express()

  app.use(requestContext)
  app.use(cors())
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ limit: '50mb', extended: true }))
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Hously Realty API is running...',
      timestamp: new Date().toISOString(),
    })
  })

  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      status: 'ok',
      service: 'hously-realty-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  })

  app.get('/api/status', asyncHandler(async (req, res) => {
    const status = await AppSettingsService.getPublicStatus()
    res.json({
      success: true,
      data: status,
    })
  }))

  app.use('/api/auth', authRoutes)
  app.use('/api/admin', adminRoutes)
  app.use(asyncHandler(maintenanceMode))

  app.use('/api/properties', propertyRoutes)
  app.use('/api/blogs', blogRoutes)
  app.use('/api/contact', contactRoutes)
  app.use('/api/whatsapp', whatsappRoutes)
  app.use('/api/uploads', uploadRoutes)
  app.use('/api/cms', cmsRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

module.exports = createApp
