'use strict';
var strata = require('strata'),
  HEADERS = require('./headers'),
  _ = require('underscore');

module.exports = function (callback) {
  strata.get('/test/request/headers', function (env, callback) {
    if (!env.headers.hasOwnProperty('x-amplify-request')) {
      return callback(400, HEADERS.text, 'request must have `x-amplify-request` header');
    }
    var headers = _.extend({}, HEADERS.json);
    headers['X-Amplify-Response'] = 'custom response header';
    var data = {header: env.headers['x-amplify-request']};
    callback(200, headers, JSON.stringify(data));
  });

  callback(null);
};