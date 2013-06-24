var hstore = require('pg-hstore');

function hstore2json() {
    if (typeof this.data === 'string')
        this.data = hstore.parse(this.data);
}

function json2hstore(next) {
    this.data = hstore.stringify(this.data);
    next();
}

module.exports = function(db, cb){
    var Measurement = db.define('Measurement', {
        data : { type: 'text', required: true }
    },{
        table : 'measurements'
      , hooks : {
            afterLoad: hstore2json ,
            beforeSave: json2hstore ,
            afterSave: hstore2json
        }
    });

    Measurement.hasOne('upload', db.models.Upload, {
        required : true
      , reverse  : 'measurement'
    })

    return cb();
}