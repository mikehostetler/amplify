'use strict';
var strata = require('strata'),
  async = require('async'),
  coreRoutes = require('./test/core/routes'),
  requestRoutes = require('./test/request/routes'),
  storeRoutes = require('./test/store/routes');

var PORT = process.argv[2] || 1982; //1982 is strata default

strata.use(strata.commonLogger);
strata.use(strata.file, __dirname);

strata.get('/', function (env, callback) {
  strata.redirect(env, callback, '/test/index.html');
});

async.parallel([
  coreRoutes.setup,
  requestRoutes.setup,
  storeRoutes.setup
], function (err) {
  if (err) {
    return console.error(err);
  }
  strata.run({port: PORT});
});

