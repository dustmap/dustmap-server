var app = require('../../lib/express.js')
  , request = require('supertest')(app)
  , async = require('async')
;


module.exports = {
    'should get 404 on index' : function(test) {
        request.get('/').expect(404, test.done);
    }

  , 'should get some nodes' : function(test) {
        request.get('/nodes').expect(200, test.done);
    }

  , 'wrong schema should generate an error' : function(test) {
        var doc = {
            'this' : [ 'doc', 'is', 'not', 'valid' ]
        };

        request
            .post('/upload')
            .send(doc)
            .expect(409, test.done)
        ;
    }

  , 'should upload simple doc' : function(test) {
        var doc = {
            testnode : {
                1234567890 : [
                    { type: 'temperature' , value: 10  } ,
                    { type: 'temperature' , value: 0x01 , id: 'something else' }
                ] ,
                1231231230 : [
                    { type: 'humidity', value: 100 }
                ]
            }
        };

        request
            .post('/upload')
            .send(doc)
            .expect(201)
            .end(function(err, res){
                var url = JSON.parse(res.text)._links.node.href;

                request.get(url).end(function(err, res){
                    var uploads = JSON.parse(res.text)._embedded.upload.length ;
                    test.equal(uploads, 2);
                    test.done();
                });
            })
        ;
    }
  
  , 'should have ratelimit headers' : function(test) {
        test.expect(1);
        request.get('/').end(function(err, res){
            test.ok( res.headers.hasOwnProperty('x-ratelimit-remaining') );
            test.done();
        });
    }

  , 'exit' : function(test){
        test.done();
        setTimeout(process.exit, 50);
    }
};