function addHAL(type, name, obj) {
    if (! this.hasOwnProperty(type) )
        this[type] = {};

    if ( this[type].hasOwnProperty(name) ) {
        if ( ! Array.isArray(this[type][name]) ) 
            this[type][name] = [ this[type][name] ];

        this[type][name].push(obj);
    } else {
        this[type][name] = obj;
    }
}


module.exports = {
    embed : function(obj, name, child) {
        return addHAL.call(obj, '_embedded', name, child);
    }

  , link : function(obj, name, href, title) {
        var link = { href : href };
        if (title)
            link.title = title;

        return addHAL.call(obj, '_links', name, link);
    }
};