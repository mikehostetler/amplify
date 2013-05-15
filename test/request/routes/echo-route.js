'use strict';
var strata = require('strata'),
  _ = require('underscore'),
  HEADERS = require('./headers');

module.exports = function (callback) {
  strata.post('/test/request/echo', function (env, callback) {
    var data = {
      echoed: true
    };
    var req = strata.Request(env);
    req.params(function (err, params) {
      if (err && strata.handleError(err, env, callback)) {
        return;
      }
      _.extend(data, params);
      callback(200, HEADERS.json, JSON.stringify(data));
    });
  });

  callback(null);
};