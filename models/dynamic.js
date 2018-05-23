const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const moment = require('moment')
const ApiError = require('../controllers/ApiErrorController.js')
const ApiErrorNames = require('../controllers/ApiErrorNames.js')
const CONST = require('../utils/const.js')
// const ClubM = require('../models/club.js')
const util = require('../utils/util')
// const socket = require('../socket')

const dynamicSchema = new Schema({
    user: {
        type: ObjectId,
        require: true
    },
    text: String,
    posters: Array,
    createDate: Date
})

dynamicSchema.pre('save', function(next) {
    if(!this.isNew) this.updateDate = Date.now()

    next()
})

dynamicSchema.statics = {

}

const DynamicM = exports.DynamicModel = mongoose.model('Dynamic', dynamicSchema)

exports.DAO = {
    create: async (ctx, next) => {
        let userId = ctx.userId
        let {
            text,
            posters
        } = ctx.request.body
        posters = posters ?  JSON.parse(posters) : []

        let dynamic = new DynamicM({
            user: userId,
            text,
            posters
        })
        try {
            let doc = await dynamic.save()
            ctx.body = {
                dynamic: doc
            }
        } catch (err) {
            util.handleApiError(err)
        }
    },
    remove: async (ctx, next) => {
        let userId = ctx.userId
        let { 
            dId
         } = ctx.query

        try {
            let dynamic = await DynamicM.findOneAndRemove({
                _id: dId,
                user: userId
            })
            if (!dynamic) throw new ApiError(ApiErrorNames.DATA_NOT_EXIST)

            ctx.body = {
                dynamic
            }
        } catch (err) {
            util.handleApiError(err)
        }
        
    },
    all: async (ctx, next) => {
        let {
            page,
            column
        } = ctx.query
        page = page ? parseInt(page) : 1
        column = column ? parseInt(column) : 10
        
        try {
            let dynamics = await DynamicM.find().populate({
                path: 'user',
                model: 'User',
                select: '_id name picture'
            })
            .sort({
                'createDate': 'desc'
            })
            .skip((page - 1) * column)
            .limit(column)
            .exec()
    
            ctx.body = {
                dynamic
            }
        } catch (err) {
            util.handleApiError(err)
        }
        
    },
    one: async (ctx, next) => {
        let userId = ctx.userId
        let {
            dId
        } = ctx.query

        try {
            let dynamic = await DynamicM.findOne({_id: dId, user: userId})
            ctx.body = {
                dynamic
            }
        } catch (err) {
            util.handleApiError(err)
        }
        
    }
}
