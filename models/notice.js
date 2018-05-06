const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
// const moment = require('moment')
const ClubM = require('../models/club')
const ApiError = require('../controllers/ApiErrorController')
const ApiErrorNames = require('../controllers/ApiErrorNames')
const CONST = require('../utils/const')
const util = require('../utils/util')

const noticeSchema = new Schema({
    type: {
        type: Number,
        required: true
    },
    refIds: [{
        type: ObjectId
    }],
    title: String,
    content: String,
    meta: {
        createDate: {
            type: Date,
            default: Date.now()
        }
    }
})

noticeSchema.statics = {}

// 生成model，并导出API
const NoticeM = exports.noticeModel = mongoose.model('Notice', noticeSchema)

exports.DAO = {
    /**
     * 创建通知
     * 
     * @method POST
     * 
     * body {
     *      type 通知人群类型 0:全部 1:某个活动人员 require
     *      clubId require
     *      aId
            title require
            content require
     * }
     */
    create: async (ctx, next) => {
        let userId = ctx.userId
        let {
            type,
            clubId,
            aId,
            title,
            content
        } = ctx.request.body
        let info = {
            type,
            title,
            content
        }
        let isForAcMember = parseInt(type) === CONST.NOTICE_FOR_MEMBER_JOINED_ACTIVITY
        if (isForAcMember) {
            if (!aId) {
                throw new ApiError(ApiErrorNames.MISSING_PAEAM)
            } else {
                info.refIds = aId
            }
        }
        
        try {
            let isOwner = await ClubM.clubModel.validateClubOwner(userId, clubId)
            if(!isOwner) throw ApiError(ApiErrorNames.FORBIDDEN)
            
            
            let notice = await NoticeM.create(info)
            await ClubM.clubModel.findByIdAndUpdate(
                clubId,
                { $addToSet: { notices: notice._id } }
            )
            if (isForAcMember) {
                //通知活动的参加者
            } else {
                // 通知所有人员
            }
            ctx.body = {
                notice
            }
        } catch(err) {
            util.handleApiError(err)
        }
    },

    /**
     * 删除通知
     * 
     * @method PUT
     * 
     */
    remove: async (ctx, next) => {
        let userId = ctx.userId
        let clubId = ctx.clubId
        let {
            nId
        } = ctx.request.body
        
        try {

            let doc = await ClubM.clubModel.findOne({
                _id: clubId,
                notices: nId
            })

            if (doc) {
                await ClubM.clubModel.update(
                    doc,
                    {
                        $pull: { notices: nId}
                    }
                )
                await NoticeM.findByIdAndRemove(nId)
                ctx.body = {}
            } else {
                throw new ApiError(ApiErrorNames.DATA_NOT_EXIST)
            }
        } catch (err) {
            util.handleApiError(err)
        }
    },

    /**
     * 查询发送成功的通知列表
     * 
     * @method GET
     */
    list: async (ctx, next) => {
        let userId = ctx.userId
        let clubId = ctx.clubId
        let {
            page,
            column
        } = ctx.query
        page = parseInt(page) || 1
        column = parseInt(column) || 5

        try {

            let club = await ClubM.clubModel.findById(clubId)
            .populate({
                path: 'notices',
                options: {
                    sort: {
                        'meta.createDate': 'desc'
                    },
                    skip: (page - 1) * column,
                    limit: column
                }
            })
            .exec()
            
            ctx.body = {
                notices: club.notices
            }
        } catch(err) {
            util.handleApiError(err)
        }
    }
}


