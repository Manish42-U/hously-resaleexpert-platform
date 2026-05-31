const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  })
}

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  const statusCode = err.statusCode || err.status || 500
  const isServerError = statusCode >= 500

  if (isServerError) {
    console.error('Server error:', err)
  }

  return res.status(statusCode).json({
    success: false,
    message: err.expose ? err.message : err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  })
}

module.exports = {
  errorHandler,
  notFoundHandler,
}
