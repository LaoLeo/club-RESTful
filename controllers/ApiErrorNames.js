/**
 * api错误名称
 */
let ApiErrorNames = {}

ApiErrorNames.UNKNOW_ERROR = 'unknowError'
ApiErrorNames.USER_NOT_EXIST = 'userNotExist'
ApiErrorNames.SERVER_ERROR = 'serverError'
ApiErrorNames.DATA_SAVE_FAIL = 'dataSaveFail'

/**
 * api对应的错误信息
 */
let error_map = new Map()

error_map.set(ApiErrorNames.UNKNOW_ERROR, { code: -1, msg: '未知错误' })
error_map.set(ApiErrorNames.USER_NOT_EXIST, { code: 101, msg: '用户不存在' })
error_map.set(ApiErrorNames.SERVER_ERROR, { code: 500, msg: '服务器发生未知错误' })
error_map.set(ApiErrorNames.DATA_SAVE_FAIL, { code: 507, msg: '数据存储失败' })

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
