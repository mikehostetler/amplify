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
  strata.post('/test/request/is_array', function (env, callback) {
    var input = env.input;
    bufferStream(input, function (err, body) {
      var result = false;
      try {
        body = JSON.parse( body.toString() );
      } catch ( e ) {

      }
      if( Object.prototype.toString.call( body ) === '[object Array]' ) {
        result = true;
      }
      callback(200, HEADERS.json, JSON.stringify({is_array: result}));
    });
    input.resume();
  });

  callback(null);
};