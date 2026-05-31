const db = require('../config/db')

const identifierPattern = /^[a-zA-Z0-9_]+$/

const quoteIdentifier = (identifier) => {
  if (!identifierPattern.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`)
  }

  return `\`${identifier}\``
}

const parseJsonField = (value, defaultValue = []) => {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value
  if (!value) return defaultValue

  try {
    return typeof value === 'string' ? JSON.parse(value) : value
  } catch {
    return defaultValue
  }
}

const stringifyJsonField = (value, defaultValue = []) => {
  if (value === undefined || value === null || value === '') {
    return JSON.stringify(defaultValue)
  }

  return typeof value === 'string' ? value : JSON.stringify(value)
}

const insertRecord = async (table, record) => {
  const entries = Object.entries(record).filter(([, value]) => value !== undefined)
  const columns = entries.map(([key]) => quoteIdentifier(key)).join(', ')
  const placeholders = entries.map(() => '?').join(', ')
  const values = entries.map(([, value]) => value)

  const [result] = await db.execute(
    `INSERT INTO ${quoteIdentifier(table)} (${columns}) VALUES (${placeholders})`,
    values,
  )

  return result
}

const updateRecord = async (table, id, updates) => {
  const entries = Object.entries(updates).filter(([, value]) => value !== undefined)
  if (entries.length === 0) return { affectedRows: 0 }

  const assignments = entries
    .map(([key]) => `${quoteIdentifier(key)} = ?`)
    .join(', ')
  const values = entries.map(([, value]) => value)

  const [result] = await db.execute(
    `UPDATE ${quoteIdentifier(table)} SET ${assignments} WHERE id = ?`,
    [...values, id],
  )

  return result
}

const deleteRecord = async (table, id) => {
  const [result] = await db.execute(
    `DELETE FROM ${quoteIdentifier(table)} WHERE id = ?`,
    [id],
  )

  return result
}

module.exports = {
  db,
  deleteRecord,
  insertRecord,
  parseJsonField,
  quoteIdentifier,
  stringifyJsonField,
  updateRecord,
}
