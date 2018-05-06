const router = require('koa-router')()

const users = require('./api/user')
const articles = require('./api/article')
const clubs = require('./api/club')
const applications = require('./api/application')
const activities = require('./api/activity')
const notices = require('./api/notice')
const courses = require('./api/course')

const middlewares = require('../utils/middlewares')

router.prefix('/api')

router.use(users.routes(), users.allowedMethods())
router.use(articles.routes(), articles.allowedMethods())
router.use(clubs.routes(), clubs.allowedMethods())
router.use(applications.routes(), applications.allowedMethods())
router.use(activities.routes(), activities.allowedMethods())
router.use(
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    notices.routes(),
    notices.allowedMethods()
)
router.use(
    middlewares.validateUserId(),
    courses.routes(),
    courses.allowedMethods()
)


module.exports = router
