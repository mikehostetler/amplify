'use strict';
var path = require('path' ),
	fs = require('fs' ),
	exec = require('child_process' ).exec,
	EOL = require('os' ).EOL,
	async = require('async' );

var PORT = process.argv[2] || 1982, //1982 is strata default
	EXEC_DELAY = process.argv[3] || 10000; //10 seconds between exection by default; gives tests time to run

var EXTERNAL_DIR = path.join(__dirname, 'external' ),
	JQUERY_REGEX = /^jquery-([\d]+\.[\d](?:\.[\d]+)?)\.js$/,
	TEST_URL = 'http://localhost:' + PORT + '/test/index.html?jquery=';

function isNotWhitespace(str) {
	return str.trim().length > 0;
}

if (!fs.existsSync(EXTERNAL_DIR)) {
	console.error('cannot locate jquery files');
	process.exit(1);
}

fs.readdir(EXTERNAL_DIR, function (err, files) {
	if (err) {
		return console.error(err);
	}
	files = files.filter(function (file) {
		return JQUERY_REGEX.test(file);
	});
	var handlers = files.map(function (file) {
		var jqueryVersion = JQUERY_REGEX.exec(file)[1];
		JQUERY_REGEX.lastIndex = 0;
		var testURL = TEST_URL + jqueryVersion;

		return function (cb) {
			console.log('opening ' + testURL);
			exec('open ' + testURL, function (err, stdout, stderr) {
				setTimeout(function () {
					if (err) {
						return cb(err.code + ': ' + stderr.toString());
					}
					cb(null, stdout.toString());
				}, EXEC_DELAY);
			});
		};
	});
	async.series(handlers, function (err, results) {
		if (err) {
			return console.error(err);
		}
		console.log(results.filter(isNotWhitespace ).join(EOL));
	});
});