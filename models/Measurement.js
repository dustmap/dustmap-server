"use strict";

var hooks = require('./hooks.js');

module.exports = function(db, cb){
    db.define('Measurement', {
        data : { type: 'text', required: true }
    },{
        table : 'measurements'
      , hooks : {
            afterLoad:  hooks.hstore2json('data') ,
            beforeSave: hooks.json2hstore('data') ,
            afterSave:  hooks.hstore2json('data')
        }
    });

    return cb();
};