"use strict";

var addHAL = function addHAL(type, name, obj, force_array) {
    if (! this.hasOwnProperty(type) )
        this[type] = {};

    if ( this[type].hasOwnProperty(name) ) {
        if ( ! Array.isArray(this[type][name]) ) 
            this[type][name] = [ this[type][name] ];

        this[type][name].push(obj);
    } else {
        this[type][name] = force_array ? [obj] : obj;
    }

    return this;
};


module.exports = {
    embed : function(obj, name, child, force_array) {
        return addHAL.call(obj, '_embedded', name, child, force_array);
    }

  , link : function(obj, name, href, title) {
        var link = { href : href };
        if (title)
            link.title = title;

        return addHAL.call(obj, '_links', name, link);
    }
};

