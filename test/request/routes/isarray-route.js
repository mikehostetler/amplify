'use strict';
var strata = require('strata'),
  _ = require('underscore'),
  HEADERS = require('./headers');

module.exports = function (callback) {
  strata.post('/test/request/is_array', function (env, callback) {
    var req = strata.Request(env);
    req.body(function (err, body) {
      if (err && strata.handleError(err, env, callback)) {
        return;
      }

      console.log('got json:\n' + JSON.stringify(body));
      var result = false;
      if( Object.prototype.toString.call( body ) === '[object Array]' ) {
    result=true;
}
      callback(200, HEADERS.json, JSON.stringify({is_array: result}));
    });
  });

  callback(null);
};