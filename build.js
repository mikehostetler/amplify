// Depends upon https://github.com/mde/node-jake: npm install jake
var sys = require('sys'),
    fs  = require('fs')

var BUILD_TARGET = "amplify",
    CONCAT_FILES = [];

task('default', ['compress'], function(params) {
});

task('compress', ['concat'], function() {
	var jsp = require('uglify-js').parser;
	var pro = require('uglify-js').uglify;

	fs.readFile("amplify/amplify.js", "utf8", function(err, contents) {
		sys.puts("Contents length: " + contents.length);
		var ast = jsp.parse(contents);
		ast = pro.ast_mangle(ast);
		ast = pro.ast_squeeze(ast);
		var final = pro.gen_code(ast);

		fs.writeFile("amplify/amplify.min.js", final, function(err) {
			if ( err ) {
				return;
			}
			sys.puts("Wrote: amplify/amplify.min.js (" + final.length + ")");
			complete();
		});
	});
}, true);

task('concat', ["setup"], function() {
	var files = [
		'core/amplify.core.js', 
		'request/amplify.request.js',
		'store/amplify.store.js'
	],
	combined = "amplify/amplify.js";
	
	var out = fs.openSync(combined, 'w');

	sys.puts("Combining files: " + combined);
	var x = files.length;
	for ( var i = 0; i < files.length; i++ ) {
		fs.readFile(files[i], function(err, contents) {
			if ( err ) {
				sys.puts('ERR: Error reading file: ' + files[i]);
				contents = "\n\n/**** ERROR READING FILE " + files[i] + " ****/\n\n";
			} else {
				sys.puts("\tWriting: " + files[i] + " (" + contents.length + ")");
			}
			fs.writeSync(out, contents, 0, contents.length, null);

			if ( --x == 0 ) {
				fs.closeSync(out);
				complete();
			}
		});
	}
}, true);

task('setup', [], function() {
	// Ensure that our build target directory exists
	fs.stat(BUILD_TARGET, function(err, stat) {
		if ( err ) {
			fs.mkdir(BUILD_TARGET, 0755, function(err) { 
				sys.puts('Created ' + BUILD_TARGET);
				next();
			});
		} else {
			next();
		}
	});

	var next = function() {
		copyFile("GPL-LICENSE.txt", BUILD_TARGET + "/GPL-LICENSE.txt");
		copyFile("MIT-LICENSE.txt", BUILD_TARGET + "/MIT-LICENSE.txt", function() {
			complete();
		});
	};
}, true);

task('clean', [], function() {
	sys.puts('TODO: Remove BUILD_TARGET directory');
});

var copyFile = function(from, to, cb) {
	fs.readFile(from, function(err, data) {
		if ( err ) {
			sys.puts("Failed to read file: " + from + " " + err);
			return false;
		}
		fs.writeFile(to, data, function(err) { 
			sys.puts(from + " => " + to);
			if ( cb ) {
				cb();
			}
		});
	});
};


/*
{ "name" : "Amplify",
  "build" : [
  	{ "action" : "concat",
	  "files" : [
	  	"core/amplify.core.js",
		"request/amplify.request.js",
		"store/amplify.store.js"
	  ],
	  "output" : "amplify/amplify.js"
	},
	{ "action" : "uglify",
	  "files" : [
	  	"amplify/amplify.js"
	  ],
	  "output" : "amplify/amplify.min.js"
	},
	{ "action" : "copy",
	  "files" : [
	  	"GPL-LICENSE.txt",
		"MIT-LICENSE.txt"
	  ],
	  "output" : "amplify/"
	},
	{ "action" : "zip",
	  "files" : [
	  	"amplify/"
	  ],
	  "output" : "amplify.zip"
  ]
}
*/
