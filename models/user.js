const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const moment = require('moment')
const axios = require('axios')
const ApiError = require('../controllers/ApiErrorController.js')
const ApiErrorNames = require('../controllers/ApiErrorNames.js')
const CONST = require('../utils/const.js')
const ClubM = require('../models/club.js')
const conf = require('../config')
const util = require('../utils/util')

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    sex: Number, // 1man,2woman
    phone: String,
    picture: String,
    backgroundWall: String,
    signature: String,
    status: Number,
    openid: String,
    session_key: String,
    clubs_join: [{
        type: ObjectId,
        ref: 'Club'
    }],
    clubs_own: [{
        type: ObjectId,
        ref: 'Club'
    }],
    meta: {
        createDate: {
            type: Date,
            default: Date.now()
        },
        updateDate: {
            type: Date,
            default: Date.now()
        }
    }  
})

userSchema.pre('save', function(next) {
    if(!this.isNew) this.meta.updateDate = Date.now()
    next()
})

userSchema.statics = {
    getClubsRef: (id) => {
        return new Promise((resolve, reject) => {
            UserM.findById(id).populate('clubs_own').populate('clubs_join').exec((err, user) => {
                if(err) reject(err)

                resolve(user)
            })
        })
    },
    getClubsNotJoin: (id) => {
        return new Promise((resolve, reject) => {
            UserM.findById(id).exec((err, user) => {

                let {clubs_own, clubs_join} = user
                let clubsRef = clubs_own.concat(clubs_join)
                let clubIDsRef = []
                if(clubsRef.length > 0) {
                    for(let clubId of clubsRef) {
                        clubIDsRef.push(clubId)
                    }
                }

               ClubM.clubModel.find({_id: {$nin: clubIDsRef}}).exec((err, clubs) => {
                    resolve(clubs)
               })
            })
            
        })
        
        
    }
}

// 生成model，并导出API
const UserM = exports.userModel = mongoose.model('User', userSchema)

exports.DAO = {
    login: async (ctx, next) => {
        let {
            code,
            userInfo
        } = ctx.request.body
        
        let uri = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.AppID}&secret=${conf.AppSecret}&js_code=${code}&grant_type=authorization_code`
        let res = await axios.get(uri)
        let data = res.data
        if (res.status !== 200) throw new ApiError(null, 404, '获取不到openid，errcode：'+data.errcode+',errmsg:'+data.errmsg)

        let user = await UserM.findOne({openid: data.openid})
        if (!user) {
            user = new UserM({
                name: userInfo.nickName,
                picture: userInfo.avatarUrl,
                sex: userInfo.gender,
                openid: data.openid,
                session_key: data.session_key,
                status: 1
            })
            try {
                user = await user.save()
            } catch (err) {
                throw new ApiError(ApiErrorNames.SERVER_ERROR)
            }
        }

        ctx.body = {
            user,
            token: util.encodeToken({
                userId: user._id.toJSON()
            })
        }

    },

    create: async (ctx, next) => {
        const params = ctx.request.body
        const name = params.name || ''
        const picture = params.picture || ''
        if(!name || !picture) throw new ApiError(ApiErrorNames.MISSING_PAEAM)

        let usr = new UserM({
            name,
            picture,
            status: 1
        })
        try {
            let result = await usr.save()
            ctx.body = {
                user: result
            }
        } catch(err) {
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    },

    getInfo: async (ctx, next) => {
        let userId = ctx.userId

        try {
            let user = await UserM.getClubsRef(userId)
            ctx.body = {
                user
            }
        } catch(err) {
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    },

    editInfo: async (ctx, next) => {
        const params = ctx.request.body
        if(!params._id) throw new ApiError(null, 400, '非法操作')
        let info = {}
        if(params.name) info.name = params.name
        if(params.sex) info.sex = parseInt(params.sex)
        if(params.phone) info.phone = params.phone
        if(params.picture) info.picture = params.picture
        if(params.backgroundWall) info.backgroundWall = params.backgroundWall
        if(params.signature) info.signature = params.signature

        try {
            let resultDoc = await UserM.findByIdAndUpdate(
                params._id,
                { $set: Object.assign({}, info) },
                { new: true }
            )
            // depatch save hook
            resultDoc.save()
            ctx.body = {
                user: resultDoc
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    },

    getClubsRelateSelf: async (ctx, next) => {
        let {userId} = ctx.query
        if(!userId) throw new ApiError(null, 400, '非法操作')

        try {
            let userRef = await UserM.getClubsRef(userId)
            ctx.body = {
                clubs_join: userRef.clubs_join,
                clubs_own: userRef.clubs_own
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }

    },

    getClubsRecommend: async (ctx, next) => {
        let {userId} = ctx.query
        let clubsRecommendArr = []
        if(!userId) throw new ApiError(null, 400, '非法操作')

        try {
            let clubsNotJoin = await UserM.getClubsNotJoin(userId)
            if(clubsNotJoin.length > CONST.CLUB_RECOMMEND_NUMBER) {
                let indexArr = []
                while(indexArr.length < CONST.CLUB_RECOMMEND_NUMBER) {
                    let index = Math.floor(Math.random() * clubsNotJoin.length)
                    if(indexArr.indexOf(index) > -1) continue

                    indexArr.push(index)
                }        
                for(let i = 0; i < indexArr.length; i++) {
                    let index = indexArr[i]
                    clubsRecommendArr.push(clubsNotJoin[index])
                }
            }else {
                clubsRecommendArr = clubsNotJoin
            }
            ctx.body = {
                clubs_recommend: clubsRecommendArr
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    }
}
