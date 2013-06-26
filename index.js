var express = require('express')
  , app = express()
  , routes = require('./routes')
  , ormloader = require('./models')
  , ratelimit = require('./lib/ratelimit.js')
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
});

routes(app);

if (!module.parent) {
    var port = process.env.PORT || 3000;
    app.listen(port, function(){
        console.log('listening on port', port);
    });
}
