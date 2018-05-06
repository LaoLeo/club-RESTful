const router = require('koa-router')()
const CourseM = require('../../models/course')
const middlewares = require('../../utils/middlewares')

router.prefix('/course')

router.post(
    '/create',
    middlewares.validateClubOwner(),
    middlewares.validateParams('body title content'),
    CourseM.DAO.create
)
router.put(
    '/remove',
    middlewares.validateClubOwner(),
    middlewares.validateParams('body cId'),
    CourseM.DAO.remove
)
router.put(
    '/edit',
    middlewares.validateClubOwner(),
    middlewares.validateParams('body cId'),
    CourseM.DAO.edit
)
router.get(
    '/list',
    middlewares.validateParams('query page column clubId'),
    CourseM.DAO.list
)

module.exports = router
