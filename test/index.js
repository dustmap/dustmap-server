var app = require('../lib/express.js')
  , request = require('supertest')(app)
  , async = require('async')
;

module.exports = {
    tearDown : function(cb) {
        /*
         * after the last test, shut down the process
         */
        cb();
        setTimeout( process.exit, 1000 );
    } ,

    'http tests' : {

        'should get 404 on index' : function(test) {
            request.get('/').expect(404, test.done);
        } ,

        'should get some nodes' : function(test) {
            request.get('/nodes').expect(200, test.done);
        } ,

        'wrong schema should generate an error' : function(test) {
            var doc = {
                'this' : [ 'doc', 'is', 'not', 'valid' ]
            };

            request
                .post('/upload')
                .send(doc)
                .expect(409, test.done)
            ;
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
                .expect(201, test.done);
        }

    }

};