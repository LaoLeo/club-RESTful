const fs = require('fs')
const path = require('path')
const conf = require('../config')
const util = require('../utils/util')
const ApiError = require('../controllers/ApiErrorController')
const ApiErrorNames = require('../controllers/ApiErrorNames')

class Image {
    constructor() {

    }

    HandleBase64Upload() {
        return async (ctx, next) => {

            let imageData =  ctx.request.body.image
            let imageType
            let base64Data =  imageData.replace(/^data:image\/\w+;base64,/, function(str, type) {
                imageType = type
                return  ''
            })
            let dataBuffer = Buffer.from(base64Data, 'base64')

            let url = util.formatImageSaveURL(ctx.userId, imageType)

            try {
                fs.writeFileSync(url, dataBuffer)
                ctx.body = {
                    imageURI: `${ctx.origin+url}`
                }
            } catch (err) {
                console.log(err)
                throw new ApiError(null, 500, '图片保存失败')
            }
        }
    }

    HandleBlobUpload() {
        return async (ctx, next) => {
            console.log(ctx)
            let body = ctx.request.body
            let image = body.files.image

            let url = util.formatImageSaveURL(ctx.userId, image.type)
            try {
                let buffer = fs.readFileSync(image.path)
                fs.writeFileSync(url, buffer)
                ctx.body = {
                    imageURI: `${ctx.origin+url}`
                }
                
            } catch (err) {
                console.log(err)
                throw new ApiError(null, 500, '图片保存失败')
            }
        }
    }
}

module.exports = new Image()