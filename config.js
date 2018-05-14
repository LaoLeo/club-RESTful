const isDev = process.env.NODE_ENV === 'development'

module.exports = {
    port: 3000,
    mongodb: isDev ? 'mongodb://127.0.0.1:27017/clubs_db' : 'mongodb://clubs_runner：clubs1226@127.0.0.1:39999/clubs',

    staticDir: 'static',
    imageSaveDir: '/image'
}