const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId

const singleCommentSchema = new Schema({
    from: { type: ObjectId, ref: 'User' },
    to: { type: ObjectId, ref: 'User' },
    content: String,
    heart: [{ type: ObjectId, ref: 'User' }]
})

const commentSchema = new Schema({
    activity: { type: ObjectId, ref: 'Activity' },
    from: { type: ObjectId, ref: 'User' },
    heart: [{ type: ObjectId, ref: 'User' }],
    reply: [singleCommentSchema],
    hot: singleCommentSchema,
    meta: {
        createDate: {
            type: Date,
            default: Date.now()
        }
    }
})