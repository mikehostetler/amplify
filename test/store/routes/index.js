'use strict';
var strata = require('strata');

//test page
strata.get('/test/store', function (env, callback) {
  strata.redirect(env, callback, '/test/store/test.html');
});

module.exports = {
  setup: function (callback) {
    callback(null);
  }
};