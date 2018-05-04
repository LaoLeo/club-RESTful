const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const convert = require('koa-convert')
const logger = require('koa-logger')
const middlewares = require('./utils/middlewares')

app.use(async(ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, x-access-token')
  // Content-Type表示具体请求中的媒体类型信息
  // ctx.set("Content-Type", "application/json;charset=utf-8");
  await next()
})

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))
const routers = require('./routes/index')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(convert(json()))
app.use(convert(logger()))
app.use(require('koa-static')(__dirname + '/public'))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(middlewares.handleAccessToken())
app.use(middlewares.response_formatter('^/api'))

// routes
app.use(routers.routes(), routers.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
