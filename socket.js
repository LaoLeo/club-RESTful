const socket = require('socket.io')
const app = require('./app')

module.exports = {
    install(sever) {

        let io = socket(sever)
        io.on('connection', (socket) => {
            console.log('sokect 连接成功')
            socket.on('clientConnected', (data) => {
                console.log(`用户${data.userId}登录服务器...`)
                // socket.emit('client@{5ae992809da6021b28e187c4}', { msg: '收到收到'})
                socket.emit('client@{5ae9b17efc522f23183a86ae}', { msg: 'hello world' })
            })
        })

        return io
    },

    /**
     * 
     * @param {Array} userIds 
     * @param {Object} data 
     */
    pushMsg(io, userIds = [], data) {

        for (let i = 0; i < userIds.length; i++) {
            let userId = userIds[i]
            if (userId instanceof Object) userId = userId.toJSON()
            let eventName = `client@{${userId}}`
            io.emit(eventName, data)
        }
        console.log('push over')
    }
}