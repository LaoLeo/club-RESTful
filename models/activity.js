const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const moment = require('moment')

const activitySchema = new Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    author: {
        type: String,
        require: true
    },
    status: Number,
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

const ActivityM = exports.ActivityModel = mongoose.model('Activity', activitySchema)

ActivityM.pre('save', function(next) {
    if(!this.isNew) this.meta.updateDate = Date.now()

    next()
})

ActivityM.static = {}

exports.DAO = {
    create: async (ctx, next) => {}
}


