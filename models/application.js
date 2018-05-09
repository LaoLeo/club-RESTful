const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const ApiError = require('../controllers/ApiErrorController.js')
const ApiErrorNames = require('../controllers/ApiErrorNames.js')
const CONST = require('../utils/const.js')
const ClubM = require('../models/club.js')
const socket = require('../socket')

const applicationSchema = new Schema({
    applicant: {
        type: ObjectId,
        ref: 'User'
    },
    status: {
        type: Number,
        default: CONST.APPLICATION_UNTREATED
    },
    introduce: String,
    createDate: {
        type: Date,
        default: Date.now(),
    }
})
applicationSchema.statics = {
    updateStatus: (aId, status) => {
        return new Promise((resolve, reject) => {
            ApplicationM.findByIdAndUpdate(
                aId, 
                { $set: {status: status}},
                { new: true },
                (err, doc) => {
                    if(err) reject(err)

                    resolve(doc)
                }
            )
        })
    }
}


const ApplicationM = exports.applicationModel = mongoose.model('Application', applicationSchema)

exports.DAO = {
    // 创建申请
    create: async (ctx, next) => {
        let {
            clubId,
            userId,
            introduce
        } = ctx.request.body
        if(!clubId || !userId || !introduce) throw new ApiError(ApiErrorNames.MISSING_PAEAM)
        
        try {
            let application = await ApplicationM.create({
                applicant: userId,
                introduce
            })
            let club = await ClubM.clubModel.findById(clubId)
            club.application.push(application._id)
            await club.save()
            
            ctx.body = {}

            // 推送
            socket.pushMsg(
                ctx.app.io, 
                [club.owner],
                {   
                    application: {
                        status: 2,
                        _id: application._id,
                        user: {
                            name: ctx.userQuery.name,
                            picture: ctx.userQuery.picture,
                            phone: ctx.userQuery.phone,
                            introduce: introduce,
                        }
                    },
                    msg: `${ctx.userQuery.name} 申请加入${club.name}`
                }
            )
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
        
    },

    // 获取申请列表
    getList: async (ctx, next) => {
        let { userId, page, column } = ctx.query 
        let application = []
        if(!userId) throw new ApiError(ApiErrorNames.MISSING_PAEAM)

        page = parseInt(page) || 1
        column = parseInt(column) || 10
        try {
            let club = ClubM.clubModel.findOne({owner: userId})
            if(club) {
                let doc = await club.populate({
                        path: 'application',
                        model: 'Application',
                        options: {
                            skip: (page - 1) * column,
                            limit: column
                        },
                        populate: {
                            path: 'applicant',
                            select: '_id name picture',
                            model: 'User'
                        }
                    }).exec()
                if(doc.application.length > 0) {
                    application = doc.application
                }
            }
            ctx.body = {
                application: application
            }

        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    },

    // 处理申请
    handle: async (ctx, next) => {
        let {
            status,
            aId,
            clubId
        } = ctx.request.body
        if(status === undefined || !aId || !clubId) throw new ApiError(null, 400, '无效处理')

        try {
            status = parseInt(status)
            if(status === CONST.APPLICATION_SUCCESS) {
                let application = await ApplicationM.updateStatus(aId, CONST.APPLICATION_SUCCESS)
                await ClubM.clubModel.findByIdAndUpdate(
                    clubId,
                    { $addToSet: { members: application.applicant } }
                )
                /**
                 * 通知成功
                 */
                // 推送
                socket.pushMsg(
                    ctx.app.io, 
                    [application.applicant],
                    {   
                        application: {
                            status: 1,
                            club: {
                                _id: ctx.club._id,
                                name: ctx.club.name,
                                picture: ctx.club.picture,
                                backgroundWall: ctx.club.backgroundWall,
                                signature: ctx.club.signature,
                                summary: ctx.club.summary
                            }
                        },
                        msg: `${ctx.club.name} 同意了你的申请`
                    }
                )
                
            }else if(status === CONST.APPLICATION_REJECT) {
                let application = await ApplicationM.updateStatus(aId, CONST.APPLICATION_REJECT)
                /**
                 * 通知拒绝
                 */
                // 推送
                socket.pushMsg(
                    ctx.app.io, 
                    [application.applicant],
                    {   
                        application: {
                            status: 0
                        },
                        msg: `${ctx.club.name} 拒绝了你的申请`
                    }
                )

            } 
            ctx.body = {}

        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
    },

    // 删除申请
    remove: async (ctx, next) => {
        let {
            aId,
            clubId
        } = ctx.query
        if(!aId || !clubId) throw new ApiError(ApiErrorNames.MISSING_PAEAM)

        try {
            let updateInfo = await ClubM.clubModel.update(
                {_id: clubId},
                {$pull: { application: aId }},
                { safe: true }
            )
            if(updateInfo.ok) {
                await ApplicationM.findByIdAndRemove(aId)
                ctx.body = {}
            }else {
                throw new ApiError(ApiErrorNames.DATA_HANDLE_FAIL)
            }

            
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
        
    }
}