"use strict";

module.exports.up = function(db, cb) {
    db.runSql('create extension if not exists hstore', cb);
};

module.exports.down = function(db, cb) {
    db.runSql('drop extension hstore', cb);
};