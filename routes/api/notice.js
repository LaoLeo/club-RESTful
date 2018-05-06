const router = require('koa-router')()
const NoticeM = require('../../models/notice')
const middlewares = require('../../utils/middlewares')

router.prefix('/notice')

router.post(
    '/create',
    middlewares.validateParams('body type clubId title content'),
    NoticeM.DAO.create
)
router.put(
    '/remove',
    middlewares.validateParams('body nId'),
    NoticeM.DAO.remove
)
router.get(
    '/list',
    middlewares.validateParams('query page column'),
    NoticeM.DAO.list
)

module.exports = router

