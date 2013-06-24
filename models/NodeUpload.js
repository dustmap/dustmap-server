var hstore = require('pg-hstore');

var hstore2json = function() {
    if (typeof this.data === 'string')
        this.data = hstore.parse(this.data);
}

var json2hstore = function(next) {
    this.data = hstore.stringify(this.data);
    return next();
}

module.exports = function(db, cb){
    var NodeUpload = db.define('NodeUpload', {
        node_name : { type: 'text', required: true }
      , ts : { type: 'date', required: true }
      , data : { type: 'binary', required: true }
    },{
        table : 'node_uploads'
      , id : 'node_id'
      , hooks : {
            afterLoad: hstore2json ,
            beforeSave: json2hstore ,
            afterSave: hstore2json
        }
    });

    return cb();
}