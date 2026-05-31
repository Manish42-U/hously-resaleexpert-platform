const AppSettingsService = require('../services/AppSettingsService')

const maintenanceMode = async (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    return next()
  }

  const isAdminRoute = req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')
  if (!isAdminRoute && await AppSettingsService.isMaintenanceMode()) {
    const status = await AppSettingsService.getPublicStatus()
    return res.status(503).json({
      success: false,
      maintenance: true,
      message: status.maintenanceMessage,
    })
  }

  return next()
}

module.exports = maintenanceMode
