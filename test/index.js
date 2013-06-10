var app = require('../')
  , request = require('supertest')(app)
  , last_run = undefined;
;

module.exports = {
    setUp : function(cb) {
        this.start = new Date();
        last_run = this.start;
        cb();
    } ,
    tearDown : function(cb) {
        /*
         * We need to kill the process, otherwise the server will
         * not terminate and kkep listening. the timeout is needed,
         * so nodeunit can finish up the tests
         */
        cb();

        var self = this;
        setTimeout(function(){
            if (last_run == self.start)
                process.exit();
        }, 1000);
    } ,

    'should upload simple doc' : function(test) {
        var doc = {
            testnode : {
                1234567890 : [
                    { type: 'temperature' , value: 10  }
                ]
            }
        };

        request
            .post('/upload')
            .send(doc)
            .expect(201, test.done)
        ;
    } ,

    'wrong schema should generate an error' : function(test) {
        var doc = {
            'this' : [ 'doc', 'is', 'not', 'valid' ]
        };

        request
            .post('/upload')
            .send(doc)
            .expect(500, test.done)
        ;
    } ,

    /*
    'ratelimit should ratelimit' : function(test) {
        var limit = 10;
        var codes = [];

        function done() {
            if (codes.length >= limit)
                test.done();
        }

        while (limit--) {
            request.post('/upload').end(function(err, res){
                codes.push(res.statusCode);
                done();
            });
        }
    }
    */
}