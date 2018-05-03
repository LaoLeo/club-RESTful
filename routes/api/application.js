const ApplicationM = require('../../models/application')
const router = require('koa-router')()

router.prefix('/application')

router.post('/create', async (ctx, next) => ApplicationM.DAO.create(ctx, next))
router.get('/list', async (ctx, next) => ApplicationM.DAO.getList(ctx, next))
router.put('/handle', async (ctx, next) => ApplicationM.DAO.handle(ctx, next))
router.delete('/remove', async (ctx, next) => ApplicationM.DAO.remove(ctx, next))

module.exports = router