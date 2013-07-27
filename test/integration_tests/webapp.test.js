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
                    { type : 'temperature' , value : 0x01 , id : 'somwthing else "$$$"' }
                ]
            } ,
            "test node 2" : {
                1234567890 : [
                    { type : 'temperature' , value : 25.5 } ,
                    { type : 'temperature' , value : 20.1 , id : 'indoor' } ,
                    { type : 'humidity' , value : 50 } ,
                    { type : 'particle_concentration' , value : 2000 }
                ]
            }
        };

        request
            .post('/upload')
            .send(doc)
            .expect(201)
            .end(test.done)
        ;
    }

  , 'exit' : function(test){
        test.done();
        setTimeout(process.exit, 50);
    }
};