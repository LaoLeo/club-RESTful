const ApiError = require('../controllers/ApiErrorController')
const ApiErrorNames = require('../controllers/ApiErrorNames')
const UserM = require('../models/user')
const ClubM = require('../models/club')
const util = require('../utils/util')

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
            } else {
                throw err
            }
        }

        if(reg.test(ctx.originalUrl)) {

            response_formatter(ctx)
        }
    }
}

const handleAccessToken = () => {

    return async (ctx, next) => {
        if(ctx.header['x-access-token']) {
            try {
                /**
                 * todo 解密access_token
                 */
                // let access_token = JSON.parse(ctx.header['x-access-token'])
                if (ctx.header['x-access-token']) {
                    let access_token = util.decodeToken(ctx.header['x-access-token'])
                    ctx.userId = access_token.userId
                }
            } catch(err) {
                console.log('无效JSON字符串：', ctx.header['x-access-token'])
            }
            
        }

        await next()
    }
}

const validateUserId = () => {

    return async (ctx, next) => {
        if(!ctx.userId) throw new ApiError(ApiErrorNames.UNAUTHORIZED)
        
        let userQuery = await UserM.userModel.findById(ctx.userId)
        if(userQuery) {
            ctx.userQuery = userQuery
            await next()
        }else {
            throw new ApiError(ApiErrorNames.UNAUTHORIZED)
        }
    }
}

const validateClubOwner = () => {
    return async (ctx, next) => {
        let clubOwn = await ClubM.clubModel.getClubOwnByUserId(ctx.userId)
        let clubId = clubOwn && clubOwn[0]
        if(!clubId) {
            throw new ApiError(ApiErrorNames.FORBIDDEN)
        } else {
            ctx.clubId = clubId.toJSON()
            ctx.club = await ClubM.clubModel.findById(clubId)
            await next()
        }
    }
}

const validateParams = (paramStr) => {

    return async (ctx, next) => {
        let args = paramStr.split(' ') 
        let type = args.shift()
        let paramsOrigin
        if (type === 'body') {
            paramsOrigin = ctx.request.body
        } else if(type === 'query') {
            paramsOrigin = ctx.query
        } else {
            console.log(new Error('参数来源类型错误：', type))
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }

        for (let i = 0; i < args.length; i++) {
            let param = paramsOrigin[args[i]]
            if(param === '' || param === null || param === false || param === undefined) {
                throw new ApiError(ApiErrorNames.MISSING_PAEAM)
            }
        }

        await next()
    }
}

const validateTime = () => {
    return async (ctx, next) => {
        let {
            startTime,
            endTime
        } = ctx.request.body

        
        if(startTime && endTime) {
            startTime = new Date(parseInt(startTime))
            endTime = new Date(parseInt(endTime))

            if (startTime.getTime() > endTime.getTime()) {
                throw new ApiError(null, 400, '开始时间应该小于结束时间')
            }

            ctx.request.body.startTime = startTime
            ctx.request.body.endTime = endTime
        }
        
        await next()

    }
}

module.exports = {
    response_formatter: url_filter,
    handleAccessToken,
    validateUserId,
    validateClubOwner,
    validateParams,
    validateTime
}
