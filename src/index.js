import Router from '@koa/router'
import Koa from 'koa'
import { promises as fs } from 'fs'
import winston from 'winston'
import path from 'path'
import NodeCache from 'node-cache'

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 })

const BASE_ULTIMATEMEMBER_DIR = process.env.BASE_ULTIMATEMEMBER_DIR || '/'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'search' },
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.json()
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
})

const app = new Koa()

const router = new Router()

const resolveProfileImage = async (id) => {
  try {
    const cached = myCache.get(`assets:${id}`)

    if (cached) return cached

    const dir = path.resolve(path.join(BASE_ULTIMATEMEMBER_DIR, '/ultimatemember'), `./${id}`)
    logger.info(dir)

    const dirContent = await fs.readdir(dir)

    const assets = {}

    const variants = {
      40: 'profile_photo-xs',
      80: 'profile_photo-sm',
      300: 'profile_photo-m',
      400: 'profile_photo-l',
      800: 'profile_photo-xl',
      1200: 'profile_photo-xxl',
      500: 'cover_photo-s',
      600: 'cover_photo-m',
      1500: 'cover_photo-l'
    }

    const fallback = {
      profile_photo: 'profile_photo',
      cover_photo: 'cover_photo'
    }

    dirContent
      .reduce((res, value) => {
        const name = value.split('-')[0].split('.')[0]
        let key = value.split('.')[0].split('-')[1]

        if (key) {
          // if key is not undefined, we may need to remove x variant
          key = key.split('x')[0]
        }

        if (!res[key]) {
          const variant = variants[key] || fallback[name]

          res[variant] = `https://resonate.is/wp-content/uploads/ultimatemember/${id}/${value}`

          assets[variant] = res[variant]
        }

        return res
      }, {})

    myCache.set(`assets:${id}`, assets, 10000)

    return assets
  } catch (err) {
    throw err
  }
}

router.get('/:id', async (ctx, next) => {
  try {
    ctx.body = await resolveProfileImage(ctx.params.id)
  } catch (err) {
    ctx.throw(ctx.status, 'Failed to fetch profile image')
  }
  await next()
})

app
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

export default app
