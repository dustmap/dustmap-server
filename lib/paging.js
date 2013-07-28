"use strict";

function sorter(a, b){
    return (a - b);
}

function gate(val, def, min, max) {
  var vals = [ +val || def ];

  if ('undefined' !== typeof min)
      vals.push(min);
  if ('undefined' !== typeof max)
      vals.push(max);

  if (vals.length < 2)
      return def;

  return (vals.sort(sorter))[1];
}

module.exports = function(key) {
    key = key || 'page';

    return function(req, res, next) {
        req[key] = {
            limit  : gate(req.query.limit, 25, 1, 200)
          , offset : gate(req.query.offset, 0)
        };
        return next();
    };
};