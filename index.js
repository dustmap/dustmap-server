var express = require('express')
  , app = express()
  , rate = require('express-rate')
  , routes = require('./routes')
  , orm = require('./models')
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
    app.all('*', rate.middleware({
        interval : 1
      , limit : 10
    }));
    app.use(express.favicon());
    app.use(express.bodyParser());
});

orm(function(err, db){
    if (err)
        throw err;

    routes(app, db);

    if (!module.parent) {
        var port = process.env.PORT || 3000;
        app.listen(port, function(){
            console.log('listening on port', port);
        });
    }
}) 
