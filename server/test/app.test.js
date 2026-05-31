const assert = require('node:assert/strict')
const { Readable, Writable } = require('node:stream')
const { test } = require('node:test')

const createApp = require('../app')

const request = (app, method, url) => new Promise((resolve, reject) => {
  const req = new Readable({ read() {} })
  req.push(null)
  req.method = method
  req.url = url
  req.headers = {}
  req.socket = {
    remoteAddress: '127.0.0.1',
  }

  const chunks = []
  const headers = {}
  const res = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.from(chunk))
      callback()
    },
  })

  res.statusCode = 200
  res.setHeader = (name, value) => {
    headers[name.toLowerCase()] = value
  }
  res.getHeader = name => headers[name.toLowerCase()]
  res.removeHeader = name => {
    delete headers[name.toLowerCase()]
  }
  res.end = (chunk) => {
    if (chunk) chunks.push(Buffer.from(chunk))
    resolve({
      status: res.statusCode,
      headers,
      body: Buffer.concat(chunks).toString('utf8'),
    })
  }
  res.on('error', reject)

  app.handle(req, res, reject)
})

const jsonRequest = async (app, method, url) => {
  const response = await request(app, method, url)
  return {
    ...response,
    json: JSON.parse(response.body),
  }
}

test('GET / returns API metadata', async () => {
  const app = createApp()
  const response = await jsonRequest(app, 'GET', '/')

  assert.equal(response.status, 200)
  assert.equal(response.json.success, true)
  assert.match(response.json.message, /API is running/)
})

test('GET /api/health returns service health', async () => {
  const app = createApp()
  const response = await jsonRequest(app, 'GET', '/api/health')

  assert.equal(response.status, 200)
  assert.equal(response.json.success, true)
  assert.equal(response.json.status, 'ok')
})

test('unknown routes return structured 404 response', async () => {
  const app = createApp()
  const response = await jsonRequest(app, 'GET', '/missing-route')

  assert.equal(response.status, 404)
  assert.equal(response.json.success, false)
  assert.equal(response.json.path, '/missing-route')
})
