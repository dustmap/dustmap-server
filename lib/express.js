var express = require('express')
  , app = express()
  , routes = require('../routes')
  , ormloader = require('../models')
  , ratelimit = require('../lib/ratelimit.js')
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


    app.use(function(req, res, next){
        req.page = {
            limit  : Math.min( +req.query.limit || 25 , 200 )
          , offset : +req.query.offset || 0
        };
        return next();
    });

});

routes(app);

