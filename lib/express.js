"use strict";

var express = require('express')
  , app = express()
  , routes = require('../routes')
  , ormloader = require('../models')
  , ratelimit = require('../lib/ratelimit.js')
  , paging = require('../lib/paging.js')
;
module.exports = app;


app.configure('production', function(){
    app.use(express.logger());
});
app.configure('development', function(){
    app.use(express.logger('dev'));
});
app.configure(function(){
    app.use(express.limit('2mb'));
    app.use(ratelimit());
    app.use(express.favicon());
    app.use(ormloader());
    app.use(paging());
});

app.all('*', function(req, res, next){
    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
    return next();
});

routes(app);
