module.exports = function(db, cb){
    var Upload = db.define('Upload', {
        ts : { type: 'date', required: true }
//      , node : { type: 'number', required: true, rational: false, unsigned: true }
    },{
        table : 'uploads'
    });

    Upload.hasOne('node', db.models.Node, {
        required : true
      , reverse  : 'uploads'
    });

    return cb();
};