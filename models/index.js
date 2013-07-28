"use strict";

var orm = require('orm')
  , transaction = require("orm-transaction")
  , async = require('async')
;

var default_con = require('../database.json')[ process.env.NODE_ENV || 'dev' ];

var default_opts = {
    define: function(db, models){
        db.use(transaction);
        db.settings.set('properties.association_key', '{name}');
        db.settings.set('instance.cache', false);

        /*
         *  we need to load the models in the right order to make sure, we can setup
         *  relations (hasOne, ...) between them
         */
        var files = [
            'Node'
          , 'Upload'
          , 'Measurement'
          , 'NodeUpload'
        ];

        async.eachSeries(
            files
          , function(file, cb){
                db.load(file, cb);
            }
          , function(err) {
                if (err)
                    throw err;

                Object.keys(db.models).forEach(function(name){
                    models[name] = db.models[name];
                });
            }
        );
    }
};

module.exports = function(con, opts) {
    return orm.express( con || default_con , opts || default_opts );
};
