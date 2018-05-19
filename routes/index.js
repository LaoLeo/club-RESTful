const router = require('koa-router')()

const users = require('./api/user')
const articles = require('./api/article')
const clubs = require('./api/club')
const applications = require('./api/application')
const activities = require('./api/activity')
const notices = require('./api/notice')
const courses = require('./api/course')
const images = require('./api/image')

const middlewares = require('../utils/middlewares')

if (process.env.NODE_ENV === 'development') router.prefix('/api')

router.use(users.routes(), users.allowedMethods())
router.use(articles.routes(), articles.allowedMethods())
router.use(clubs.routes(), clubs.allowedMethods())
router.use(activities.routes(), activities.allowedMethods())
router.use(applications.routes(),applications.allowedMethods())
router.use(courses.routes(),courses.allowedMethods())
router.use(notices.routes()).use(notices.allowedMethods())
router.use(images.routes()).use(images.allowedMethods())


module.exports = router
