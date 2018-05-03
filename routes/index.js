const router = require('koa-router')()

const users = require('./api/user')
const articles = require('./api/article')
const clubs = require('./api/club')
const applications = require('./api/application')

router.prefix('/api')

router.use(users.routes(), users.allowedMethods())
router.use(articles.routes(), articles.allowedMethods())
router.use(clubs.routes(), clubs.allowedMethods())
router.use(applications.routes(), applications.allowedMethods())

module.exports = router
