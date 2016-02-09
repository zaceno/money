const express = require('express');

var app = express();

if (process.env.liveReload) {
    app.use(require('connect-livereload')());
}

app.use('/', express.static(__dirname + '/static'));

var start = function (callback) {
    var port = process.env.PORT || 80;
    var host = process.env.HOST || '127.0.0.1';
    var server = app.listen(port, host, (err) => {
        if (err) return callback(err);
        callback && callback(null, server, app);
    });
}

module.exports = start;
if (require.main === module) start((err, server) => {
    if (err) console.log('ERROR', err);
    if (server) {
        var addr = server.address();
        console.log('listening on %s:%s', addr.address, addr.port);
    };
});
