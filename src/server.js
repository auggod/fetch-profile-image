import Koa from 'koa'
import error from 'koa-json-error'
import mount from 'koa-mount'
import logger from 'koa-logger'
import compress from 'koa-compress'

const app = new Koa()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv-safe').config() // babel-watch support
}

app
  .use(logger())
  .use(compress())
  .use(error(err => {
    return {
      status: err.status,
      message: err.message,
      data: null
    }
  }))

app.use(mount(require('./index.js')))

const port = process.env.APP_PORT || 3000

app.listen(port, () => {
  console.log('Profile image resolver listening on port:', port)
})
