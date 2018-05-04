/**
 * api错误名称
 */
let ApiErrorNames = {}

ApiErrorNames.UNKNOW_ERROR = 'unknowError'
ApiErrorNames.DATA_NOT_EXIST = 'dataNotExist'
ApiErrorNames.SERVER_ERROR = 'serverError'
ApiErrorNames.DATA_SAVE_FAIL = 'dataSaveFail'
ApiErrorNames.MISSING_PAEAM = 'missingParam'
ApiErrorNames.DATA_HANDLE_FAIL = 'dataHandleFail'
ApiErrorNames.ILLEGAL_OPERATION = 'illegalOperation'
ApiErrorNames.UNAUTHORIZED = 'unanthorized'
ApiErrorNames.FORBIDDEN = 'forbidden'


/**
 * api对应的错误信息
 */
let error_map = new Map()

error_map.set(ApiErrorNames.UNKNOW_ERROR, { code: -1, msg: '未知错误' })
error_map.set(ApiErrorNames.DATA_NOT_EXIST, { code: 101, msg: '数据不存在' })
error_map.set(ApiErrorNames.SERVER_ERROR, { code: 500, msg: '服务器发生未知错误' })
error_map.set(ApiErrorNames.DATA_SAVE_FAIL, { code: 507, msg: '数据存储失败' })
error_map.set(ApiErrorNames.MISSING_PAEAM, { code: 400, msg: '缺少参数' })
error_map.set(ApiErrorNames.DATA_HANDLE_FAIL, { code: 507, msg: '数据操作失败' })
error_map.set(ApiErrorNames.ILLEGAL_OPERATION, { code: 400, msg: '非法操作' })
error_map.set(ApiErrorNames.UNAUTHORIZED, { code: 401, msg: '未认证' })
error_map.set(ApiErrorNames.FORBIDDEN, { code: 403, msg: '无权限' })

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
