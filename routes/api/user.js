const router = require('koa-router')()
const UserM = require('../../models/user.js')
const middlewares = require('../../utils/middlewares')

router.prefix('/users')

router.get('/getInfo', middlewares.validateUserId(), async (ctx, next) => UserM.DAO.getInfo(ctx, next))
router.post('/login', middlewares.validateParams('body code'), async (ctx, next) => UserM.DAO.login(ctx, next))
router.post('/create', async (ctx, next) => UserM.DAO.create(ctx, next))
router.put('/edit', UserM.DAO.editInfo)
router.get('/clubsRelateSelf', UserM.DAO.getClubsRelateSelf)
router.get('/clubsRecommend', UserM.DAO.getClubsRecommend)

module.exports = router
