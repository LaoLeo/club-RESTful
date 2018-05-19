const ApiError = require('../controllers/ApiErrorController')
const ApiErrorNames = require('../controllers/ApiErrorNames')
const conf = require('../config')
const path = require('path')
const fs = require('fs')
const jwt = require('jwt-simple')

module.exports = {
    handleApiError: (err) => {
        console.log(err)
        if (err instanceof ApiError) {
            throw err
        } else {
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }

    },

    /**
     * @return {string: '20180102'}  
     */
    getDate: () => {
        let date = new Date()
        return `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`
    },

    /**
     * @return {string:imageSaveURL}
     */
    formatImageSaveURL(userId, imageType) {
        let date = this.getDate()
        let imageDir = conf.imageSaveDir + '/' + date
        
        let i = imageType.indexOf('/')
        if (i > -1) {
            imageType = imageType.slice(i+1)
        }
        let imageName = userId + Date.now() + '.' + imageType

        let imageStaticDir = path.join(__dirname, '../', conf.staticDir, imageDir)
        if (!fs.existsSync(imageStaticDir)) fs.mkdirSync(imageStaticDir)
        return `${imageDir}/${imageName}`
    },

    /**
     * format content
     * 
     * @param {String} content 
     * @return {String}
     */
    formatContent(content) {
        let script_reg = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
        let style_reg= /<style[^>]*?>[\s\S]*?<\/style>/gi
        return content.replace(script_reg, "").replace(style_reg, "")
    },

    encodeToken(perload) {
        return jwt.encode(perload, conf.tokenSecret)
    },

    decodeToken(token) {
        return jwt.decode(token, conf.tokenSecret)
    },

    filterOpenIdAndSessionkey(obj) {
        delete obj['openid']
        delete obj['session_key']

        return obj
    }
}