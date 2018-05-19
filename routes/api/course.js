const router = require('koa-router')()
const CourseM = require('../../models/course')
const middlewares = require('../../utils/middlewares')

router.prefix('/course')

router.post(
    '/create',
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    middlewares.validateParams('body title content'),
    middlewares.validateTime(),
    CourseM.DAO.create
)
router.put(
    '/remove',
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    middlewares.validateParams('body cId'),
    CourseM.DAO.remove
)
router.put(
    '/edit',
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    middlewares.validateParams('body cId'),
    middlewares.validateTime(),
    CourseM.DAO.edit
)
router.get(
    '/list',
    middlewares.validateUserId(),
    middlewares.validateParams('query page column clubId'),
    CourseM.DAO.list
)

module.exports = router
