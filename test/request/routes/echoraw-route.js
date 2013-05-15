'use strict';
var strata = require('strata'),
  _ = require('underscore'),
  HEADERS = require('./headers');

function bufferStream(stream, callback) {
  var buffers = [];

  stream.on('data', function (chunk) {
    buffers.push(Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk));
  });

  stream.on('end', function () {
    callback(null, Buffer.concat(buffers));
  });
}

module.exports = function (callback) {
  strata.get('/test/request/echoraw', function (env, callback) {
    var req = strata.Request(env);
    if (req.queryString.length > 0) {
      return callback(200, HEADERS.text, req.queryString);
    }
    callback(200, HEADERS.text, 'empty');
  });

  strata.post('/test/request/echoraw', function (env, callback) {
    var input = env.input;
    bufferStream(input, function (err, body) {
      if (body.length === 0) {
        return callback(200, HEADERS.text, 'empty');
      }
      callback(200, HEADERS.text, body);
    });
    input.resume();
  });

  callback(null);
};