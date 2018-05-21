const ClubM = require('../../models/club')
const router = require('koa-router')()
const middlewares = require('../../utils/middlewares')

router.prefix('/club')

router.post(
    '/create',
    middlewares.validateUserId(),
    middlewares.validateParams('body', 'name', 'picture', 'signature'),
    async (ctx, next) => ClubM.DAO.create(ctx, next))
router.get('/list', async (ctx, next) => ClubM.DAO.getClubsList(ctx, next))
router.get('/one', middlewares.validateParams('query', 'clubId'), async (ctx, next) => ClubM.DAO.getClubInfo(ctx, next))
router.put('/edit', async (ctx, next) => ClubM.DAO.editClub(ctx, next))

module.exports = router