const router = require('koa-router')()

const users = require('./api/user')
const articles = require('./api/article')

router.prefix('/api')

router.use(users.routes(), users.allowedMethods())
router.use(articles.routes(), articles.allowedMethods())

module.exports = router
