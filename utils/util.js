const ApiError = require('../controllers/ApiErrorController')
const ApiErrorNames = require('../controllers/ApiErrorNames')

module.exports = {
    handleApiError: (err) => {
        console.log(err)
        if (err instanceof ApiError) {
            throw err
        } else {
            throw new ApiError(ApiErrorNames.SERVER_ERROR)
        }

    }
}