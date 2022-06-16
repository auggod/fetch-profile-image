const test = require('tape')
const Koa = require('koa')
const supertest = require('supertest')
const destroyable = require('server-destroy')
const error = require('koa-json-error')
const mount = require('koa-mount')
const path = require('path')

require('dotenv-safe').config({ path: path.join(__dirname, '../.env') })

const router = require('../lib')
const app = new Koa()

app
  .use(error(err => {
    return {
      status: err.status,
      message: err.message,
      data: null
    }
  }))

app.use(mount(router))

let server
let request

test('start', t => {
  server = app.listen(5557)
  destroyable(server)
  request = supertest(server)
  t.end()
})

test('should fetch user images', async t => {
  t.plan(1)

  try {
    await request
      .get('/2124')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('should not find image', async t => {
  t.plan(1)

  try {
    await request
      .get('/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('shutdown', t => {
  server.close()
  t.end()
  process.exit(0)
})
