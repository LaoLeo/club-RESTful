const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const moment = require('moment')
const ApiError = require('../controllers/ApiErrorController.js')
const ApiErrorNames = require('../controllers/ApiErrorNames.js')

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    sex:  String,
    phone: String,
    picture: String,
    backgroundWall: String,
    signature: String,
    status: Number,
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

userSchema.static = {}

// 生成model，并导出API
const UserM = exports.userModel = mongoose.model('User', userSchema)

exports.DAO = {
    create: async (ctx, next) => {
        const params = ctx.request.body
        const name = params.name || ''
        const picture = params.picture || ''
        if(!name || !picture) throw (new ApiError()).setErrorInfo(400, '信息不全')

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

    editInfo: async (ctx, next) => {
        const params = ctx.request.body
        if(!params._id) throw (new ApiError()).setErrorInfo(400, '非法操作')
        let info = {}
        if(params.name) info.name = params.name
        if(params.sex) info.sex = params.sex
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
    }
}
