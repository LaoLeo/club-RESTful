const ApiErrorNames = require('./ApiErrorNames')

/**
 * 让apiError控制对api错误的返回
 */
class ApiError extends Error {

    constructor(error_name) {

        super()

        const error_info = ApiErrorNames.getErrorInfo(error_name)
        this.name = error_name
        this.code = error_info.code
        this.msg = error_info.msg

    }
}

module.exports = ApiError
