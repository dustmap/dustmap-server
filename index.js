var app = require('./lib/express')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , http_port = process.env.PORT_HTTP || process.env.PORT || 8080
  , https_port = process.env.PORT_HTTPS || 4430
;

var https_opts = {
    key:  fs.readFileSync('./certs/server.key')
  , cert: fs.readFileSync('./certs/server.crt')
}

function listening() {
    var addr = this.address();
    var type = this.hasOwnProperty('key') ? 'https' : 'http';
    console.log('* listening on %s://%s:%d', type, addr.address, addr.port);
}

var http = http.createServer(app)
    .listen(http_port, listening)
;

var https = https.createServer(https_opts, app)
    .listen(https_port, listening)
;

module.exports = {
    http: http
  , https : https
}
