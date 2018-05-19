const ApplicationM = require('../../models/application')
const router = require('koa-router')()
const middlewares = require('../../utils/middlewares')

router.prefix('/application')

router.post('/create', middlewares.validateUserId(), async (ctx, next) => ApplicationM.DAO.create(ctx, next))
router.get('/list', middlewares.validateUserId(), async (ctx, next) => ApplicationM.DAO.getList(ctx, next))
router.put(
    '/handle',
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    async (ctx, next) => ApplicationM.DAO.handle(ctx, next)
)
router.delete(
    '/remove',
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    async (ctx, next) => ApplicationM.DAO.remove(ctx, next)
)

module.exports = router