const badRequest = (message) => {
  const error = new Error(message)
  error.status = 400
  error.expose = true
  return error
}

const requireBodyFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body?.[field]
    return value === undefined || value === null || String(value).trim() === ''
  })

  if (missing.length) {
    return next(badRequest(`Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`))
  }

  return next()
}

module.exports = {
  requireBodyFields,
}
