const router = require('koa-router')()

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = {
      user_name: 'laotuzhu'
  }
})

router.get('/age', function (ctx, next) {
  ctx.body = {
      age: 22
  }
})

router.get('/async', async (ctx, next) => {
    ctx.body = {
        age: 22
    }
  })

module.exports = router
