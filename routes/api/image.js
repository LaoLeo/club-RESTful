const router = require('koa-router')()
const ImageController = require('../../controllers/imageController')
const middlewares = require('../../utils/middlewares')

router.prefix('/image')

router.post(
    '/saveBlobUpload',
    ImageController.HandleBlobUpload()
)
router.post(
    '/saveBase64Upload',
    ImageController.HandleBase64Upload()
)


module.exports = router

