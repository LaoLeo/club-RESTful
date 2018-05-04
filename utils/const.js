module.exports = {
    CLUB_RECOMMEND_NUMBER: 5,

    APPLICATION_UNTREATED: 2, // 申请未处理
    APPLICATION_SUCCESS: 1, // 申请成功
    APPLICATION_REJECT: 0, // 申请拒绝

    // activity status
    ACTIVITY_STASH: 0, // 保存未发布
    ACTIVITY_WORK: 1, // 成功发布
    ACTIVITY_INVALID: 2, // 失效

    // activity type
    ACTIVITY_ALLOW_NONE: 0, // 不用报名，仅仅宣传一下
    ACTIVITY_ALLOW_ALL: 1, // 允许所有用户报名
    ACTIVITY_ALLOW_MEMBE: 2 // 仅允许会员报名
}