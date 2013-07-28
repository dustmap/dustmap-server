"use strict";

var util = require('util');
var exec = require('child_process').exec;
var path = require('path');

var file = process.argv[1] || __filename;


function migrate(dir) {
    dir = dir || 'up';

    var m = util.format(
        './node_modules/.bin/db-migrate -e %s -c %d %s'
      , process.env.NODE_ENV || 'test'
      , Number.MAX_VALUE
      , dir
    );

    var opts = {
        cwd : path.join( (process.env.TOP || '.'), '..' )
    };
    
    exec(m, opts, function(err, stdout, stderr){
        console.log(stdout);
        console.warn(stderr);

        if (err)
            throw err;

        process.exit();
    });
}

if ( path.basename(file) === 'BEGIN.js' ) {
    migrate('up');
} else {
    migrate('down');
}

