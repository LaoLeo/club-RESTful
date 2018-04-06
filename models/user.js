const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const moment = require('moment')

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    sex: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    picture: String,
    background_wall: String,
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
    create: async (ctx, next) => {}
}


