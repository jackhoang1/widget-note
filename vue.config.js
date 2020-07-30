module.exports = {
    devServer: {
        host: '0.0.0.0',
        port: 8080, // CHANGE YOUR PORT HERE!
        https: true,
        hotOnly: false,
    },
    publicPath: process.env.NODE_ENV === 'production'
    ? '/widget-note/'
    : '/'
}