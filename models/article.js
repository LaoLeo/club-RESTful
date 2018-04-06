const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId
const moment = require('moment')

const articleSchema = new Schema({
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

const ArticleM = exports.ArticleModel = mongoose.model('Article', articleSchema)

ArticleM.pre('save', function(next) {
    if(!this.isNew) this.meta.updateDate = Date.now()

    next()
})

ArticleM.static = {}

exports.DAO = {
    create: async (ctx, next) => {
        const pamars = ctx.request.body
        let title = pamars.title
        let content = pamars.content
        let author = pamars.author

        let article = new ArticleM({
            title,
            content,
            author,
            status: 1
        })
        try {
            let result = await article.save()

            ctx.body = result

        }catch(err) {
            throw new Error('article save failed')
        }

    }
}


