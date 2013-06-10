var Payload = require('dustmap-payload');

module.exports = function(app) {

    app.post('/upload', function(req, res, next){
        var payload = new Payload();

        payload.on('finish', function(){
            res.send(201);
        });

        payload.on('error', function(){
            res.send(500);
        });

        req.pipe(payload);
    });

};