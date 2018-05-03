const router = require('koa-router')()
const UserM = require('../../models/user.js')

router.prefix('/users')

// router.get('/', function (ctx, next) {
//   ctx.body = {
//       user_name: 'laotuzhu'
//   }
// })

// router.get('/age', function (ctx, next) {
//   ctx.body = {
//       age: 22
//   }
// })

// router.get('/async', async (ctx, next) => {
//     ctx.body = {
//         age: 22
//     }
//   })

router.post('/create', async (ctx, next) => UserM.DAO.create(ctx, next))
router.put('/edit', UserM.DAO.editInfo)
router.get('/clubsRelateSelf', UserM.DAO.getClubsRelateSelf)
router.get('/clubsRecommend', UserM.DAO.getClubsRecommend)

module.exports = router
