const ClubM = require('../../models/club')
const router = require('koa-router')()

router.prefix('/club')

router.post('/create', async (ctx, next) => ClubM.DAO.create(ctx, next))
router.get('/list', async (ctx, next) => ClubM.DAO.getClubsList(ctx, next))
router.put('/edit', async (ctx, next) => ClubM.DAO.editClub(ctx, next))

module.exports = router