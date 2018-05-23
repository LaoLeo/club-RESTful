const router = require('koa-router')()
const DynamicM = require('../../models/dynamic')
const middlewares = require('../../utils/middlewares')

router.prefix('/dynamic')

router.post(
    '/create',
    middlewares.validateParams('body text posters'),
    DynamicM.DAO.create
)
router.delete(
    '/remove',
    middlewares.validateParams('query dId'),
    DynamicM.DAO.remove
)
router.get(
    '/all',
    middlewares.validateParams('query page column'),
    DynamicM.DAO.all
)
router.get(
    '/one',
    middlewares.validateParams('query dId'),
    DynamicM.DAO.one
)
router.get(
    '/list',
    DynamicM.DAO.list
)

module.exports = router
