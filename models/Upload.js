"use strict";

module.exports = function(db, cb){
    db.define('Upload', {
        ts : { type: 'date', required: true }
      , node : { type: 'number', required: true, rational: false, unsigned: true }
    },{
        table : 'uploads'
    });

    return cb();
};