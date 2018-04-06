const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
// const moment = require('moment')

/**
 * 通告的类型
 * 0 发给所用会员
 * 1 发给参加某个活动的会员
 */
const TYPES = exports.TYPES = {
    FOR_ALL_MEMBER: 0,
    FOR_MEMBER_JOINED_ACTIVITY: 1
}

const noticeSchema = new Schema({
    type: {
        type: Number,
        required: true
    },
    club: {
        type: ObjectId,
        ref: 'Club',
        required: true
    },
    activity: {
        type: ObjectId,
        ref: 'Activity'
    },
    title: String,
    content: String,
    meta: {
        createDate: {
            type: Date,
            default: Date.now()
        }
    }  
})

noticeSchema.static = {}

// 生成model，并导出API
const NoticeM = exports.noticeModel = mongoose.model('Notice', noticeSchema)

exports.DAO = {
    create: async (ctx, next) => {}
}


