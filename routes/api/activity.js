const ActivityM = require('../../models/activity')
const router = require('koa-router')()
const middlewares = require('../../utils/middlewares')

router.prefix('/activity')

router.post(
    '/create',
    middlewares.validateUserId(),
    middlewares.validateParams('body title content type'),
    async (ctx, next) => ActivityM.DAO.create(ctx, next)
)
router.put(
    '/remove',
    middlewares.validateUserId(),
    middlewares.validateParams('body activityId'),
    ActivityM.DAO.remove
)
router.put(
    '/edit',
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    middlewares.validateParams('body activityId'),
    ActivityM.DAO.edit
)
router.get(
    '/participants', 
    middlewares.validateUserId(), 
    middlewares.validateParams('query activityId'),
    ActivityM.DAO.getParticipants
)
router.get(
    '/listsInClub', 
    middlewares.validateUserId(), 
    middlewares.validateParams('query clubId page column'),
    ActivityM.DAO.getActivitiesInClub
)
router.get(
    '/list', 
    middlewares.validateParams('query page column'),
    ActivityM.DAO.getActivities
)
router.post(
    '/participate',
    middlewares.validateUserId(), 
    middlewares.validateParams('body activityId'),
    ActivityM.DAO.participate
)
router.get(
    '/participated', 
    middlewares.validateUserId(), 
    middlewares.validateParams('query page column'), 
    ActivityM.DAO.getParticipated
)
router.put(
    '/invalid', 
    middlewares.validateUserId(),
    middlewares.validateClubOwner(),
    middlewares.validateParams('body activityId'), 
    ActivityM.DAO.InvalidActivity
)

module.exports = router