"use strict";

exports.up = function(db, callback) {
    /* if location == null, it's an anon. node we have no info about yet */
    var stmt = 'alter table nodes add column location point null default null;';
    db.runSql(stmt, callback);
};

exports.down = function(db, callback) {
    var stmt = 'alter table nodes drop column location;';
    db.runSql(stmt, callback);
};
