const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
// const moment = require('moment')

const clubSchema = new Schema({
    name: String,
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    member: [{
        type: ObjectId,
        ref: 'User'
    }],
    picture: String,
    background_wall: String,
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

clubSchema.static = {}

// 生成model，并导出API
const ClubM = exports.clubModel = mongoose.model('Club', clubSchema)

exports.DAO = {
    create: async (ctx, next) => {}
}


