"use strict";

var hstore = require('pg-hstore');

function hstore2json(field) {
    return function() {
        if (typeof this[field] === 'string')
            this[field] = hstore.parse(this[field]);
    };
}

function json2hstore(field) {
    return function(done) {
        this[field] = hstore.stringify(this[field]);
        done();
    };
}

module.exports = {
    hstore2json : hstore2json
  , json2hstore : json2hstore
};
