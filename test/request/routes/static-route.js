'use strict';
var strata = require('strata'),
  path = require('path'),
  fs = require('fs'),
  _ = require('underscore'),
  async = require('async');

var STATIC_DIR = path.join(__dirname, 'static');

var CONTENT_TYPE_MAP = {
  'application/json': ['json'],
  'application/javascript': ['javascript', 'js'],
  'text/html': ['html', 'htm'],
  'text/plain': ['txt'],
  'text/xml': ['xml'],
  'text/csv': ['csv'],
  'text/css': ['css']
};

function makeRoute(fileName, fileContent) {
  var fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
  var headers = {};
  _.each(CONTENT_TYPE_MAP, function (extensions, contentType) {
    if (_.contains(extensions, fileExtension)) {
      headers['Content-Type'] = contentType;
    }
  });
  if (!_.has(headers, 'Content-Type')) {
    headers['Content-Type'] = 'text/plain';
  }
  var path = '/test/request/static/' + fileName;
  strata.get(path, function (env, callback) {
    callback(200, headers, fileContent);
  });
}

function readFile(file, callback) {
  var filePath = path.join(STATIC_DIR, file);
  fs.readFile(filePath, function (err, content) {
    if (err) {
      return callback(err);
    }
    callback(null, {file: file, content: content});
  });
}

function isFile(entry, callback) {
  var filePath = path.join(STATIC_DIR, entry);
  fs.stat(filePath, function (err, stat) {
    if (err) {
      return callback(false);
    }
    callback(stat.isFile());
  });
}

module.exports = function (callback) {
  fs.readdir(STATIC_DIR, function (err, entries) {
    if (err) {
      return callback(err);
    }
    async.filter(entries, isFile, function (allFiles) {
      async.map(allFiles, readFile, function (err, allContent) {
        if (err) {
          return callback(err);
        }
        _.each(allContent, function (fileContent) {
          makeRoute(fileContent.file, fileContent.content);
        });
        callback(null);
      });
    });
  });
};