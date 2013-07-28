"use strict";

var app = require('./lib/express')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
;

var listening = function listening() {
    var addr = this.address();
    var type = this.hasOwnProperty('key') ? 'https' : 'http';
    console.log('* listening on %s://%s:%d', type, addr.address, addr.port);
};

function startHttp() {
    var port = process.env.npm_package_config_http_port;
    if (port) {
        var srv = http.createServer(app).listen(port, listening);
        module.exports.http = srv;
    }
}

function startHttps() {
    var port = process.env.npm_package_config_https_port;
    if (port) {
        var opts = {
            key:  fs.readFileSync(process.env.npm_package_config_https_key)
          , cert: fs.readFileSync(process.env.npm_package_config_https_cert)
        };
        var srv = https.createServer(opts, app).listen(port, listening);
        module.exports.https = srv;
    }
}

startHttp();
startHttps();

