const ApiError = require('../controllers/ApiErrorController')

/**
 * 在app.use(router)前调用
 */
const response_formatter = (ctx) => {
    if(ctx.body) {
        ctx.body = {
            code: 200,
            msg: 'success',
            data: ctx.body
        }
    }else {
        ctx.body = {
            code: 404,
            msg: 'api not exist'
        }
    }
}

const url_filter = (parrern) => {

    return async (ctx, next) => {

        let reg = new RegExp(parrern)

        try {

            //先去执行路由
            await next()
        }catch(err) {

            if(err instanceof ApiError && reg.test(ctx.originalUrl)) {
                ctx.status = 200
                ctx.body = {
                    code: err.code,
                    msg: err.msg
                }

                // 日志操作
                // coding...
                return 
            }
        }

        if(reg.test(ctx.originalUrl)) {

            response_formatter(ctx)
        }
    }
}

module.exports = {
    response_formatter: url_filter
}
