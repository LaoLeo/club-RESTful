const ArticleM = require('../../models/article')
const router = require('koa-router')()

router.prefix('/article')

router.get('/', function (ctx, next) {
    ctx.body = {
        a: 'a'
    }
})
router.post('/create', async (ctx, next) => ArticleM.DAO.create(ctx, next))

module.exports = router