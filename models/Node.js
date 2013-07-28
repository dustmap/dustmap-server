"use strict";

function lonlat(field) {
    return function(val) {
        if (val !== undefined) {
            this.location[field] = val;
        }
        return this.location[field];
    };
}

module.exports = function(db, cb){
    db.define('Node', {
        name     : { type: 'text',  required: true  }
      , owner    : { type: 'text',  required: true  }
      , location : { type: 'point', required: false }
    },{
        table : 'nodes'
      , methods : {
            lon : lonlat('x')
          , lat : lonlat('y')
        }
    });

    return cb();
};