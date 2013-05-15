'use strict';
var strata = require('strata'),
  HEADERS = require('./headers');

module.exports = function (callback) {
  strata.get('/test/request/delay', function (env, callback) {
    setTimeout(function () {
      var data = {delayed: 'request'};
      callback(200, HEADERS.json, JSON.stringify(data));
    }, 5000);
  });

  callback(null);
};

