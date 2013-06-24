var orm = require('orm')
  , coninfo = require('../database.json')[ process.env.NODE_ENV || 'dev' ]
  , transaction = require("orm-transaction")
;

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

module.exports = function(cb, con) {
    con = con || coninfo;

    return orm.connect(con, function(err, db){
        db.use(transaction);
        db.settings.set('properties.association_key', '{name}');
        db.settings.set('instance.cache', false);

        var loaded = 0;
        var errors = [];

        files.forEach(function(file) {
            db.load(file, function(err) {
                loaded++;

                if (err) {
                    console.error('Error loading model', file, err);
                    errors.push(err);
                }

                if (loaded === files.length) {
                    cb( errors.length ? errors : null, db );
                }
            });
        });
    });
}

// db.settings.set("properties.primary_key", "id");
// require('./validator').attach(db);
