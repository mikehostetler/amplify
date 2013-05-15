'use strict';
var strata = require('strata'),
  async = require('async');

//test page
strata.get('/test/core', function (env, callback) {
  strata.redirect(env, callback, '/test/core/test.html');
});

module.exports = {
  setup: function (callback) {
    callback(null);
  }
};