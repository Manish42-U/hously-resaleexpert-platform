const { parseJsonField } = require('./dbHelpers')

class BaseModel {
  constructor({ table, jsonFields = [], booleanFields = [], numberFields = [] }) {
    this.table = table
    this.jsonFields = jsonFields
    this.booleanFields = booleanFields
    this.numberFields = numberFields
  }

  normalize(row) {
    if (!row) return null

    const normalized = { ...row }

    this.jsonFields.forEach((field) => {
      normalized[field] = parseJsonField(row[field])
    })

    this.booleanFields.forEach((field) => {
      normalized[field] = !!row[field]
    })

    this.numberFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== null) {
        normalized[field] = Number(row[field])
      }
    })

    return normalized
  }
}

module.exports = BaseModel
