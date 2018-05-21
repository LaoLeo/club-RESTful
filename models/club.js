const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
// const moment = require('moment')
const UserM = require('./user.js')
const ApiError = require('../controllers/ApiErrorController.js')
const ApiErrorNames = require('../controllers/ApiErrorNames.js')
const util = require('../utils/util')

const clubSchema = new Schema({
    name: String,
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    members: [{
        type: ObjectId,
        ref: 'User'
    }],
    application: [{
        type: ObjectId,
        ref: 'Application'
    }],
    picture: String,
    backgroundWall: String,
    signature: String,
    summary: String,
    status: Number,
    // 以后可能加入推文功能，现在以活动为主
    // articles: [{
    //     type: ObjectId,
    //     ref: 'Article'
    // }],
    activities: [{
        type: ObjectId,
        ref: 'Activity'
    }],
    courses: [{
        type: ObjectId,
        ref: 'Course'
    }],
    notices: [{
        type: ObjectId,
        ref: 'Notice'
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

clubSchema.pre('save', function(next) {
    if(!this.isNew) this.meta.updateDate = Date.now()

    next()
})

clubSchema.statics = {
    getClubOwnByUserId: async (id) => {
        try {
            let userDoc = await UserM.userModel.findOne({_id: id}).select('clubs_own').lean().exec()
            if(userDoc) {
                return userDoc.clubs_own
            }else {
                return null
            }
            
        } catch(err) {
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    },
    validateClubOwner: async (userId, clubId) => {
        let userDoc = await UserM.userModel.findOne({_id: userId}).select('clubs_own').lean().exec()
        let flag = false

        if(userDoc && userDoc.clubs_own[0].toJSON() === clubId) flag = true

        return flag
    }
}

// 生成model，并导出API
const ClubM = exports.clubModel = mongoose.model('Club', clubSchema)

exports.DAO = {
    create: async (ctx, next) => {
        const params = ctx.request.body
        let userId = ctx.userId
        let info = {}
        let {
            name,
            picture,
            signature,
            summary
        } = params
        if (summary) summary = util.formatContent(summary)
        
        let clubOwn = await ClubM.getClubOwnByUserId(userId)
        if(clubOwn.length > 0) throw new ApiError(null, 400, '一人只能创建一个社团')

        let club = new ClubM({
            name,
            userId,
            picture,
            signature,
            summary,
            status: 1,
            owner: userId
        })
        
        try {
            let clubDoc = await club.save()
            if(clubDoc) {
                let userDoc = await UserM.userModel.findById(userId)   
                userDoc.clubs_own.push(clubDoc._id)
                await userDoc.save()
                ctx.body = {
                    club: clubDoc
                }
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.DATA_SAVE_FAIL)
        }
    },

    editClub: async (ctx, next) => {
        let {
            userId,
            picture,
            backgroundWall,
            signature,
            summary
        } = ctx.request.body
        let info = {}
        if(!userId) throw new ApiError(null, 400, '非法操作')
        if(picture) info.picture = picture
        if(backgroundWall) info.backgroundWall = backgroundWall
        if(signature) info.signature = signature
        if(summary) info.summary = util.formatContent(summary)

        try {
            let clubOwn = await ClubM.getClubOwnByUserId(userId)
            let clubHadUpdate = await ClubM.findByIdAndUpdate(
                clubOwn[0],
                { $set: info },
                { new: true }
            )
            await clubHadUpdate.save()
            ctx.body = {
                club: clubHadUpdate
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    },

    getClubsList: async (ctx, next) => {
        let {
            page, 
            column
        } = ctx.request.body
        page = parseInt(page) || 1
        column = parseInt(column) || 10 

        try {
            let clubsList = await ClubM.find()
                .skip((page - 1) * column)
                .limit(column)
                .select('_id name picture signature')
            
            ctx.body = {
                clubsList
            }
        } catch(err) {
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
        
    }
}


