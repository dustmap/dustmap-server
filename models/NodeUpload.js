"use strict";

var hooks = require('./hooks.js');

module.exports = function(db, cb){
    db.define('NodeUpload', {
        node_name : { type: 'text', required: true }
      , ts : { type: 'date', required: true }
      , data : { type: 'binary', required: true }
    },{
        table : 'node_uploads'
      , id : [ 'node_id' , 'upload' ]
      , hooks : {
            afterLoad:  hooks.hstore2json('data') ,
            beforeSave: hooks.json2hstore('data') ,
            afterSave:  hooks.hstore2json('data')
        }
    });

    return cb();
};