/**
 * api错误名称
 */
let ApiErrorNames = {}

ApiErrorNames.UNKNOW_ERROR = 'unknowError'
ApiErrorNames.USER_NOT_EXIST = 'userNotExist'

/**
 * api对应的错误信息
 */
let error_map = new Map()

error_map.set(ApiErrorNames.UNKNOW_ERROR, { code: -1, msg: '未知错误' })
error_map.set(ApiErrorNames.USER_NOT_EXIST, { code: 101, msg: '用户不存在' })

ApiErrorNames.getErrorInfo = (error_name) => {
    let error_info 
    
    if(error_name) {
        error_info = error_map.get(error_name)   
    }

    if(!error_info) {
        error_info = error_map.get(ApiErrorNames.UNKNOW_ERROR)
    }

    return error_info
}

module.exports = ApiErrorNames
