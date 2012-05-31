/*jshint node: true */
module.exports = function( grunt ) {

function getDate() {
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate();
	if ( month < 10 ) {
		month = "0" + month;
	}
	if ( day < 10 ) {
		day = "0" + day;
	}
	return year + "-" + month + "-" + day;
}

function createBanner( module ) {
	return "/*! Amplify " + module + " v" + version + " - http://amplifyjs.com\n" +
		" * Copyright (c) " + year + " appendTo LLC (http://appendto.com/team)\n" +
		" * Licensed " + licenses + " http://appendto.com/open-source-licenses */";
}

var pkg = require( "./package" ),
	licenses = grunt.utils._.pluck( pkg.licenses, "type" ).join( ", " ),
	version = pkg.version,
	year = (new Date()).getFullYear(),
	buildDate = getDate(),
	buildDir = "amplify-" + version,
	distVer = "dist/" + buildDir;

var components = [ "core", "store", "request" ];

grunt.initConfig({
	meta: {
		bannerCore: createBanner( "Core" ),
		bannerStore: createBanner( "Store" ),
		bannerRequest: createBanner( "Request" ),
		bannerAll: createBanner( "Core, Store, Request" )
	},

	lint: {
		src: components.map(function( component ) {
			return component + "/amplify." + component + ".js";
		}),
		test: components.map(function( component ) {
			return component + "/test/unit.js";
		}),
		grunt: "grunt.js"
	},

	jshint: (function() {
		var rc = grunt.file.readJSON( ".jshintrc" ),
			settings = {
				options: rc,
				globals: {}
			};

		(rc.predef || []).forEach(function( prop ) {
			settings.globals[ prop ] = true;
		});
		delete rc.predef;

		return settings;
	})(),

	copy: {
		dist: {
			src: [
				"*LICENSE*"
			],
			renames: {
				"build/README.txt": "README.txt",
				"vsdoc/amplify-vsdoc.js": "amplify-vsdoc.js"
			},
			dest: distVer
		},
		src: {
			src: [
				"core/**",
				"store/**",
				"request/**",
				"external/**",
				"test/**"
			],
			renames: {
				"build/src-README.txt": "README.txt"
			},
			dest: distVer + "/src"
		},
		min: {
			src: [
				"dist/*.min.js",
				"dist/individual/*"
			],
			dest: distVer,
			strip: /^dist\//
		}
	},

	concat: {
		full: {
			src: [
				"<banner:meta.bannerAll>",
				distVer + "/src/core/amplify.core.js",
				distVer + "/src/store/amplify.store.js",
				distVer + "/src/request/amplify.request.js"
			],
			dest: distVer + "/amplify.js"
		}
	},

	min: {
		"dist/individual/amplify.core.min.js": [ "<banner:meta.bannerCore>", "core/amplify.core.js" ],
		"dist/individual/amplify.store.min.js": [ "<banner:meta.bannerStore>", "store/amplify.store.js" ],
		"dist/individual/amplify.request.min.js": [ "<banner:meta.bannerRequest>", "request/amplify.request.js" ],
		"dist/amplify.min.js": [ "<banner:meta.bannerAll>", distVer + "/amplify.js" ]
	},

	zip: {
		dist: {
			src: buildDir,
			dest: buildDir + ".zip"
		}
	}
});

grunt.registerTask( "clean", function() {
	require( "rimraf" ).sync( "dist" );
});

grunt.registerMultiTask( "copy", "Copy files to destination folder and replace @tokens", function() {
	function replaceTokens( source ) {
		return source
			.replace( /@VERSION/g, version )
			.replace( /@BUILD_DATE/g, buildDate );
	}

	function copyFile( src, dest ) {
		if ( /(js|css|txt)$/.test( src ) ) {
			grunt.file.copy( src, dest, {
				process: replaceTokens
			});
		} else {
			grunt.file.copy( src, dest );
		}
	}

	var fileName,
		files = grunt.file.expandFiles( this.file.src ),
		target = this.file.dest + "/",
		strip = this.data.strip,
		renameCount = 0;

	files.forEach(function( fileName ) {
		var targetFile = strip ? fileName.replace( strip, "" ) : fileName;
		copyFile( fileName, target + targetFile );
	});
	grunt.log.writeln( "Copied " + files.length + " files." );

	for ( fileName in this.data.renames ) {
		renameCount += 1;
		copyFile( fileName, target + grunt.template.process( this.data.renames[ fileName ], grunt.config() ) );
	}
	if ( renameCount ) {
		grunt.log.writeln( "Renamed " + renameCount + " files." );
	}
});

grunt.registerMultiTask( "zip", "Create a zip file", function() {
	var done = this.async(),
		src = this.file.src,
		dest = this.file.dest;

	grunt.utils.spawn({
		cmd: "zip",
		args: [ "-r", dest, src ],
		opts: {
			cwd: "dist"
		}
	}, function( err, result ) {
		if ( err ) {
			grunt.log.error( err );
			done();
			return;
		}
		grunt.log.writeln( "Zipped " + dest );
		done();
	});
});

grunt.registerTask( "default", "lint" );
grunt.registerTask( "release", "clean copy:dist copy:src concat min copy:min zip" );

};
