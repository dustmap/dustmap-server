module.exports = function(db, cb){
    var Node = db.define('Node', {
        name  : { type: 'text', required: true }
      , owner : { type: 'text', required: true }
    },{
        table : 'nodes'
    });

/*
    Node.hasMany('uploads', db.models.Upload, {}, {
        // required: true
        reverse: 'node'
    });
*/

    return cb();
}