'use strict';
var strata = require('strata'),
  async = require('async');

//test page
strata.get('/test/request', function (env, callback) {
  strata.redirect(env, callback, '/test/request/test.html');
});

//routes for test page
var routes = [
  require('./delay-route'),
  require('./echo-route'),
  require('./echoraw-route'),
  require('./headers-route'),
  require('./jsonp-route')
];

module.exports = {
  setup: function (callback) {
    async.parallel(routes, callback);
  }
};
