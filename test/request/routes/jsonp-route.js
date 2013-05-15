'use strict';
var strata = require('strata'),
  HEADERS = require('./headers'),
  _ = require('underscore');

module.exports = function (callback) {
  strata.get('/test/request/jsonp', function (env, callback) {
    if (env.queryString.length === 0) {
      return callback(400, HEADERS.text, 'query string is missing');
    }
    var pairs = env.queryString.split('&');
    var parts = _.map(pairs, function (pair) {
      pair = pair.split('=');
      return {key: pair[0], value: pair[1]};
    });
    var callbackParam = _.find(parts, function (part) {
      return part.key === 'callback';
    });
    if (!callbackParam) {
      return callback(400, HEADERS.text, 'no `callback` param specified in query string');
    }
    var data = callbackParam.value + '(' + JSON.stringify({foo: 'bar'}) + ')';
    callback(200, HEADERS.text, data);
  });

  callback(null);
};