const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const ClubM = require('../models/club')
const ApiError = require('../controllers/ApiErrorController')
const ApiErrorNames = require('../controllers/ApiErrorNames')
const CONST = require('../utils/const')
const util = require('../utils/util')

const courseSchema = new Schema({
    title: String,
    content: String,
    startTime: Date,
    endTime: Date,
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

courseSchema.statics = {}

const CourseM = exports.courseModel = mongoose.model('Course', courseSchema)

exports.DAO = {
    /**
     * 创建课程
     * 
     * @method POST
     * body {
     *      title require
     *      content require
     *      startTime
     *      endTime
     * }
     */
    create: async (ctx, next) => {
        let clubId = ctx.clubId
        let {
            title,
            content,
            startTime,
            endTime
        } = ctx.request.body
        content = util.formatContent(content)

        try {
            let course = await CourseM.create({
                title,
                content,
                startTime,
                endTime
            })
            await ClubM.clubModel.findByIdAndUpdate(
                clubId,
                {
                    $addToSet: { courses: course._id }
                }
            )
            ctx.body = {
                course
            }
        } catch (err) {
            util.handleApiError(err)
        }
    },

    /**
     * 删除course
     * 
     * @method PUT
     */
    remove: async (ctx, next) => {
        let clubId = ctx.clubId
        let {
            cId
        } = ctx.request.body

        try {
            let doc = await ClubM.clubModel.findOne({
                _id: clubId,
                courses: cId
            })
            if (doc) {
                let updateInfo = await ClubM.clubModel.update(
                    {
                        _id: clubId,
                    },
                    {
                        $pull: {
                            courses: cId
                        }
                    }
                )
                if(updateInfo.ok) {
                    let course = await CourseM.findByIdAndRemove(cId)
                    ctx.body = {
                        course
                    }
                }
            } else {
                throw new ApiError(ApiErrorNames.DATA_NOT_EXIST)
            }

        } catch (err) {
            util.handleApiError(err)
        }
    },

    /**
     * 修改课程
     * 
     * @method PUT
     */
    edit: async (ctx, next) => {
        let clubId = ctx.clubId
        let {
            cId,
            title,
            content,
            startTime,
            endTime
        } = ctx.request.body
        let info = {}
        if (title) info.title = title
        if (content) info.content = util.formatContent(content)
        if (startTime) info.startTime = startTime
        if (endTime) info.endTime = endTime

        try {
            let doc = await ClubM.clubModel.findOne({
                _id: clubId,
                courses: cId
            })
            if (!doc) throw new ApiError(ApiErrorNames.DATA_NOT_EXIST)

            let courseHasUpdate = await CourseM.findByIdAndUpdate(
                cId,
                {
                    $set: Object.assign({}, info, {'meta.updateDate': Date.now()})
                },
                { new: true }
            )
            ctx.body = {
                course: courseHasUpdate
            }
        } catch (err) {
            util.handleApiError(err)
        }
    },

    /**
     * 查询课程列表
     * 
     * @method GET
     * 
     */
    list: async (ctx, next) => {
        let {
            clubId,
            page,
            column
        } = ctx.query
        page = parseInt(page) || 1
        column = parseInt(column) || 5

        try {
            let club = await ClubM.clubModel.findById(clubId)
            .populate({
                path: 'courses',
                options: {
                    sort: {
                        'meta.updateDate': 'desc'
                    },
                    skip: ( page - 1 ) * column,
                    limit: column
                }
            })
            .exec()
            ctx.body = {
                courses: club.courses
            }
        } catch (err) {
            util.handleApiError(err)
        }
    }
}