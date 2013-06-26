var limiter = require('connect-ratelimit');

var default_conf = {
    whitelist : [ ]
  , blacklist : [ ]
  , catagories : {
        whitelist: {
            // max. 1000 requests in 10 seconds
            totalRequests: 1000,
            every:         10 * 1000
        }
      , blacklist: {
            // no requests at all
            totalRequests: 0,
            every:         0 
        }
      , normal: {
            // max 100 requests in 10 seconds
            totalRequests: 100 ,
            every:         10 * 1000
        }
    }
};

module.exports = function(conf) {
    return limiter( conf || default_conf );
}
