const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const moment = require('moment')
const ApiError = require('../controllers/ApiErrorController.js')
const ApiErrorNames = require('../controllers/ApiErrorNames.js')
const CONST = require('../utils/const.js')
const ClubM = require('../models/club.js')
const util = require('../utils/util')
const socket = require('../socket')

const activitySchema = new Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    posters: {
        type: Array
    },
    author: {
        type: ObjectId,
        ref: 'Club'
    },
    type: Number,
    status: Number, //stash: 0, work: 1, invalid: 2
    participants: [{
        type: ObjectId,
        ref: 'User'
    }],
    praises: [{
        type: ObjectId,
        ref: 'Praise'
    }],
    comments: [{
        type: ObjectId,
        ref: 'comment'
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

activitySchema.pre('save', function(next) {
    if(!this.isNew) this.meta.updateDate = Date.now()

    next()
})

activitySchema.statics = {
    validateActicty: async (userId, activityId) => {
        let clubOwn = await ClubM.clubModel.getClubOwnByUserId(userId)
        let activity = await ActivityM.findById(activityId)
        if((Array.isArray(clubOwn) && clubOwn.length === 0) || !activity ) throw new ApiError(ApiErrorNames.DATA_NOT_EXIST)

        if(clubOwn[0].toJSON() !== activity.author.toJSON()) throw new ApiError(ApiErrorNames.FORBIDDEN)

        return activity
    }
}

const ActivityM = exports.activityModel = mongoose.model('Activity', activitySchema)

exports.DAO = {
    /**
     * 创建或者暂存活动
     * 
     * @method POST
     * body: {
     *      title {String} 
     *      content {String}
     *      type {Number}
     *      stash {Number} 控制活动状态，暂存或者发布
     *      posters {ArrayString}
     * } 
     */
    create: async (ctx, next) => {
        let userId = ctx.userId
        let {
            title,
            content,
            type,
            posters,
            stash
        } = ctx.request.body
        content = util.formatContent(content)
        posters = posters ?  JSON.parse(posters) : []

        try {
            let clubOwn = await ClubM.clubModel.getClubOwnByUserId(userId)
            if(!clubOwn || (Array.isArray(clubOwn) && clubOwn.length === 0)) throw new ApiError(null, 403, '你还没有属于自己的社团哦~')
            
            let clubId = clubOwn[0]
            let activity = new ActivityM({
                author: clubId,
                title,
                content,
                type,
                posters,
                status: stash ? CONST.ACTIVITY_STASH : CONST.ACTIVITY_WORK
            })
            let club = await ClubM.clubModel.findByIdAndUpdate(
                clubId,
                { $addToSet: { activities: activity._id } }
            )
            let doc = await activity.save()
            ctx.body = {
                activity: doc
            }

            // 推送
            socket.pushMsg(
                ctx.app.io, 
                club.members.concat(ctx.userId), 
                {
                    activity: {
                        status: CONST.ACTIVITY_WORK,
                        activity: doc.toJSON()
                    },
                    msg: `${club.name} 新活动《${activity.title}》`
                }
            )
            
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.DATA_HANDLE_FAIL)
        }
        
    },

    /**
     * 删除活动
     * 
     * @method PUT
     * body {
     *      activityId
     * }
     */
    remove: async (ctx, next) => {
        let userId = ctx.userId
        let {
            activityId
        } = ctx.request.body

        try {
            let clubOwn = await ClubM.clubModel.getClubOwnByUserId(userId)
            if(!clubOwn || (Array.isArray(clubOwn) && clubOwn.length === 0)) throw new ApiError(ApiErrorNames.ILLEGAL_OPERATION)

            let club = await ClubM.clubModel.findOne({
                _id: clubOwn[0],
                activities: activityId
            })
            if(!club) throw new ApiError(ApiErrorNames.ILLEGAL_OPERATION)
            
            let updateInfo = await club.update({
                $pull: { activities: activityId}
            })
            if(updateInfo.ok) {
                await ActivityM.findByIdAndRemove(activityId)
                ctx.body = {}
            }else {
                throw new ApiError(ApiErrorNames.DATA_HANDLE_FAIL)
            }
        } catch(err) {
            console.log(err)
            if (err) {
                throw err
            } else {
                throw new ApiError(ApiErrorNames.SERVER_ERROR)
            }
        }
        
    },

    /**
     * 修改活动
     * 
     * @method PUT
     * body {
     *      activityId,
     *      title,
     *      content,
     *      type
     * }
     */
    edit: async (ctx, next) => {
        let userId = ctx.userId
        let {
            activityId,
            title,
            content,
            posters,
            type
        } = ctx.request.body

        try {
            let canEditQuery = await ActivityM.validateActicty(userId, activityId)
            if(!canEditQuery) throw new ApiError(ApiErrorNames.FORBIDDEN)

            let info = {}
            if(title) info.title = title
            if(content) info.content = util.formatContent(content)
            if(type) info.type = type
            if(posters) info.posters = JSON.parse(posters)

            let activityUpdatedDoc = await ActivityM.findOneAndUpdate(
                { _id: activityId, status: {$in: [CONST.ACTIVITY_WORK, CONST.ACTIVITY_STASH]} },
                { $set: Object.assign({}, info, {'meta.updateDate': Date.now()}) },
                { new: true }
            )
            if (activityUpdatedDoc) {
                ctx.body = {
                    activity: activityUpdatedDoc
                }

                // 推送
                socket.pushMsg(
                    ctx.app.io, 
                    ctx.club.members.concat(ctx.userId), 
                    {
                        activity: {
                            status: CONST.ACTIVITY_CHANGE,
                            activity: activityUpdatedDoc.toJSON()
                        },
                        msg: `${ctx.club.name} 活动《${activityUpdatedDoc.title}》更新`
                    }
                )
            } else {
                throw new ApiError(ApiErrorNames.DATA_HANDLE_FAIL)
            }

        } catch(err) {
            console.log(err)
            if (err instanceof ApiError) {
                throw err
            } else {
                throw new ApiError(ApiErrorNames.SERVER_ERROR)
            }
        }
        
    },

    /**
     * 列出某个活动的内容
     * 
     * @method GET
     * 
     * query {
     *      aId
     * }
     */
    getActivity: async (ctx, next) => {
        let aId = ctx.query.aId

        try {
            let activity = await ActivityM.findById(aId).populate({
                path: 'author',
                model: 'Club',
                select: '_id name picture'
            })
            if (!activity) throw ApiError(ApiErrorNames.DATA_NOT_EXIST)
            ctx.body = {
                activity
            }
        } catch (err) {
            util.handleApiError(err)
        }
    },

    /**
     * 列出报名该活动的人员信息
     * 
     * @method GET
     * 
     * query {
     *      activityId
     * }
     */
    getParticipants: async (ctx, next) => {
        let userId = ctx.userId
        let {
            activityId
        } = ctx.query
        
        try {
            let activityModle = await ActivityM.validateActicty(userId, activityId)
            if(activityModle) {
                let activityDoc = await ActivityM.populate(activityModle, {
                    path: 'participants',
                    model: 'User',
                    select: '_id name picture phone'
                })
                ctx.body = {
                    participants: activityDoc.participants
                }
            }
            
        } catch(err) {
            console.log(err)
            if (err instanceof ApiError) {
                throw err
            } else {
                throw new ApiError(ApiErrorNames.SERVER_ERROR)
            }
        }
        
    },

    /**
     * 列出该协会的所有活动
     * 
     * @method GET
     * query {
     *      clubId,
     *      page,
     *      column
     * }
     * 
     */
    getActivitiesInClub: async (ctx, next) => {
        let userId = ctx.userId
        let {
            clubId,
            page,
            column
        } = ctx.query
        
        try {
            let statusAllowArray = []
            let club = await ClubM.clubModel.findById(clubId).select('owner').exec()
            if(club.owner.toJSON() === userId) {
                statusAllowArray = [CONST.ACTIVITY_INVALID, CONST.ACTIVITY_WORK, CONST.ACTIVITY_STASH]
            }else {
                statusAllowArray = [CONST.ACTIVITY_INVALID, CONST.ACTIVITY_WORK]
            }
            page = parseInt(page) || 1
            column = parseInt(column) || 5
            let conditions = {
                author: clubId,
                status: {$in: statusAllowArray}
            }
            let activitiesQuery =  await ActivityM.find(conditions)
            let total = activitiesQuery.length
            let activities = await ActivityM.find(conditions)
            .skip((page - 1 ) * column)
            .limit(column)
            .exec()
            
            ctx.body = {
                activities,
                total
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
        
    },

    /**
     * 列出活动首页的所有活动
     * 
     * @method GET
     * 
     * query {
     *      page,
     *      column
     * }
     */
    getActivities: async(ctx, next) => {
        let {
            page,
            column
        } = ctx.query
        page = parseInt(page) || 1
        column = parseInt(column) || 10

        try {
            let activitiesQuery = await ActivityM.find({status: CONST.ACTIVITY_WORK})
            let total = activitiesQuery.length
            let activities =  await ActivityM.find({status: CONST.ACTIVITY_WORK}).populate({
                path: 'author',
                model: 'Club',
                select: '_id name picture'
            })
            .sort({
                'meta.createDate': 'desc',
                'meta.updateDate': 'desc'
            })
            .skip((page - 1) * column)
            .limit(column)
            .exec()
            ctx.body = {
                activities,
                total
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }

    },

    /**
     * 报名活动
     * 
     * @method POST
     * body {
     *      activityId
     * }
     */
    participate: async (ctx, next) => {
        let {
            activityId
        } = ctx.request.body

        try {
            let userQuery = ctx.userQuery
            if (!userQuery.phone) throw new ApiError(null, 40301, '报名之前需要绑定手机号哦~')

            let ativityQuery = await ActivityM.findById(activityId)
            if (!ativityQuery) throw new ApiError(ApiErrorNames.DATA_NOT_EXIST)

            let updateInfo
            let clubQuery
            let clubId = ativityQuery.author
            if (ativityQuery.type === CONST.ACTIVITY_ALLOW_ALL) {
                updateInfo = await ativityQuery.update({ $addToSet: { participants: ctx.userId } })
                clubQuery = await ClubM.clubModel.findOne({_id: clubId})
            } else if(ativityQuery.type === CONST.ACTIVITY_ALLOW_MEMBE) {
                clubQuery = await ClubM.clubModel.findOne({ _id: clubId, 'members': ctx.userId})
                if(clubQuery) {
                    updateInfo = await ativityQuery.update({ $addToSet: { participants: ctx.userId } })
                } else {
                    throw new ApiError(null, 403, `你不是会员哦`)
                }
                
            }
            if(updateInfo.ok) {
                ctx.body = {}

                // 推送
                socket.pushMsg(
                    ctx.app.io, 
                    [clubQuery.owner], 
                    {
                        activity: {
                            status: CONST.ACTIVITY_APPLICATE,
                            user: {
                                _id: ctx.userQuery._id,
                                name: ctx.userQuery.name,
                                picture: ctx.userQuery.picture,
                                phone: ctx.userQuery.phone
                            }
                        },
                        msg: `${ctx.userQuery.name} 报名了活动《${ativityQuery.title}》 推送`
                    }
                )
            } else {
                throw new ApiError(ApiErrorNames.DATA_HANDLE_FAIL)
            }

        } catch(err) {
            console.log(err)
            if (err instanceof ApiError) {
                throw err
            } else {
                throw new ApiError(ApiErrorNames.SERVER_ERROR)
            }
            
        }
    },

    /**
     * 列出报名成功的活动列表
     */
    getParticipated: async (ctx, next) => {
        let {
            page,
            column
        } = ctx.query
        let userId = ctx.userId
        page =  parseInt(page) || 1
        column = parseInt(column) || 5
        try {
            let activities = await ActivityM.find({
                participants: userId,
                status: { $nin: [CONST.ACTIVITY_STASH] }
            }).populate({
                path: 'author',
                model: 'Club',
                select: '_id name picture'
            })
            .sort({
                status: 'asc',
                'meta.updateDate': 'desc'
            })
            .skip((page - 1) * column)
            .limit(column)
            .exec()
            ctx.body = {
                activities
            }
        } catch(err) {
            console.log(err)
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }
        
    },

    /**
     * 失效活动，情况为活动过期、活动终止
     * 
     * @method PUT
     * body {
     *      activityId
     * }
     */
    InvalidActivity: async (ctx, next) => {
        let {
            activityId
        } = ctx.request.body

        try {
            let activityModle = await ActivityM.validateActicty(ctx.userId, activityId)
            let updateInfo = await activityModle.update({$set: {status: CONST.ACTIVITY_INVALID}})
            if (updateInfo.ok) {
                // 更新时间
                activityModle.save()
                ctx.body = {}

                // 推送
                socket.pushMsg(
                    ctx.app.io, 
                    activityModle.participants.concat(ctx.userId), 
                    {
                        activity: {
                            status: ACTIVITY_INVALID,
                            activity: {
                                _id: activityModle._id,
                                title: activityModle.title
                            }
                        },
                        msg: `${ctx.club.name} 活动《${activityModle.title}》已失效 推送`
                    }
                )
            } else {
                throw new ApiError(ApiErrorNames.DATA_HANDLE_FAIL)
            }
        } catch(err) {
            console.log(err)
            if (err instanceof ApiError) {
                throw err
            } else {
                throw new ApiError(ApiErrorNames.SERVER_ERROR)
            }
        }
        
    }
}
