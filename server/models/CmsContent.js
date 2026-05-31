const BaseModel = require('./BaseModel')
const { stringifyJsonField } = require('./dbHelpers')

class CmsContentModel extends BaseModel {
  constructor() {
    super({
      table: 'cms_content',
      jsonFields: ['content'],
    })
  }

  toRecord(key, data) {
    return {
      content_key: key,
      title: data.title || key,
      content: stringifyJsonField(data.content || {}),
    }
  }
}

module.exports = new CmsContentModel()
