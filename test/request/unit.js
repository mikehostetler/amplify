/*global amplify, test, asyncTest, start, expect, equal, deepEqual, strictEqual, ok*/
'use strict';

(function() {

var subscriptions = {};
function subscribe( topic, callback ) {
	subscriptions[ topic ] = subscriptions[ topic ] || [];
	subscriptions[ topic ].push( callback );
	return amplify.subscribe( topic, callback );
}

var ajax = $.ajax;
var lifecycle = {
	setup: function() {
		amplify.request.resources = {};
		$.each( amplify.store(), function( key ) {
			if ( /^request/.test( key ) ) {
				amplify.store( key, null );
			}
		});
	},
	teardown: function() {
		$.ajax = ajax;
		$.each( subscriptions, function( topic, callbacks ) {
			$.each( callbacks, function( _,callback ) {
				amplify.unsubscribe( topic, callback );
			});
		});
	}
};

module( "amplify.request", lifecycle );

test( "invalid resource id", function() {
	expect( 4 );

	subscribe( "request.before", function() {
		ok( false, "no messages should be published for invalid resources" );
	});

	try {
		amplify.request();
		ok( false, "should throw error with no resourceId" );
	} catch( e ) {
		equal( e, "amplify.request: no resourceId provided" );
	}

	try {
		amplify.request( "missing" );
		ok( false, "should throw error with invalid resourceId" );
	} catch ( e ) {
		equal( e, "amplify.request: unknown resourceId: missing" );
	}

	try {
		amplify.request({ data: { foo: "bar" } });
		ok( false, "should throw error with invalid resourceId" );
	} catch ( e ) {
		equal( e, "amplify.request: no resourceId provided" );
	}

	try {
		amplify.request({ resourceId: "missing" });
		ok( false, "should throw error with invalid resourceId" );
	} catch ( e ) {
		equal( e, "amplify.request: unknown resourceId: missing" );
	}
});

module( "amplify.request.define - fn", lifecycle );

asyncTest( "request( id )", function() {
	expect( 11 );

	amplify.request.define( "test", function( settings ) {
		equal( settings.resourceId, "test", "defintion: resouceId" );
		deepEqual( settings.data, {}, "definition: data" );
		settings.success({ simple: true });
	});
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "test", "before message: settings.resourceId" );
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( settings.data, {},
			"success message: settings.data" );
		deepEqual( data, { simple: true }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, {},
			"complete message: settings.data" );
		deepEqual( data, { simple: true }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "test" );
});

asyncTest( "request( id, fn )", function() {
	expect( 13 );

	amplify.request.define( "test", function( settings ) {
		equal( settings.resourceId, "test", "defintion: resouceId" );
		deepEqual( settings.data, {}, "definition: data" );
		settings.success({ simple: true });
	});
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "test", "before message: settings.resourceId" );
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( settings.data, {},
			"success message: settings.data" );
		deepEqual( data, { simple: true }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, {},
			"complete message: settings.data" );
		deepEqual( data, { simple: true }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "test", function( data, status ) {
		deepEqual( data, { simple: true }, "success callback: data" );
		equal( status, "success", "success callback: status" );
	});
});

asyncTest( "request( id, data, fn )", function() {
	expect( 13 );

	amplify.request.define( "test", function( settings ) {
		equal( settings.resourceId, "test", "defintion: resouceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 }, "definition: data" );
		settings.success({ simple: true });
	});
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "test", "before message: settings.resourceId" );
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 },
			"success message: settings.data" );
		deepEqual( data, { simple: true }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 },
			"complete message: settings.data" );
		deepEqual( data, { simple: true }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "test", { foo: "bar", baz: 1 }, function( data, status ) {
		deepEqual( data, { simple: true }, "success callback: data" );
		equal( status, "success", "success callback: status" );
	});
});

asyncTest( "request( hash ) success", function() {
	expect( 13 );

	amplify.request.define( "test", function( settings ) {
		equal( settings.resourceId, "test", "defintion: resouceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 }, "definition: data" );
		settings.success({ simple: true });
	});
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "test", "before message: settings.resourceId" );
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 },
			"success message: settings.data" );
		deepEqual( data, { simple: true }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 },
			"complete message: settings.data" );
		deepEqual( data, { simple: true }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request({
		resourceId: "test",
		data: { foo: "bar", baz: 1 },
		success: function( data, status ) {
			deepEqual( data, { simple: true }, "success callback: data" );
			equal( status, "success", "success callback: status" );
		}
	});
});

asyncTest( "request( hash ) error", function() {
	expect( 13 );

	amplify.request.define( "test", function( settings ) {
		equal( settings.resourceId, "test", "defintion: resouceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 }, "definition: data" );
		settings.error({ simple: true });
	});
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "test", "before message: settings.resourceId" );
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: settings.resourceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 },
			"error message: settings.data" );
		deepEqual( data, { simple: true }, "error message: data" );
		equal( status, "error", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, { foo: "bar", baz: 1 },
			"complete message: settings.data" );
		deepEqual( data, { simple: true }, "complete message: data" );
		equal( status, "error", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	amplify.request({
		resourceId: "test",
		data: { foo: "bar", baz: 1 },
		success: function() {
			ok( false, "success callback invoked" );
		},
		error: function( data, status ) {
			deepEqual( data, { simple: true }, "error callback: data" );
			equal( status, "error", "error callback: status" );
		}
	});
});

asyncTest( "custom status - success", function() {
	expect( 6 );

	amplify.request.define( "test", function( settings ) {
		settings.success( { data: "is good" }, "custom status" );
	});
	subscribe( "request.success", function( settings, data, status ) {
		deepEqual( data, { data: "is good" }, "success message: data " );
		equal( status, "custom status", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		deepEqual( data, { data: "is good" }, "complete message: data " );
		equal( status, "custom status", "complete message: status" );
		start();
	});

	amplify.request( "test", function( data, status ) {
		deepEqual( data, { data: "is good" }, "success callback: data " );
		equal( status, "custom status", "success callback: status" );
	});
});

asyncTest( "custom status - error", function() {
	expect( 6 );

	amplify.request.define( "test", function( settings ) {
		settings.error( { data: "is bad" }, "custom error" );
	});
	subscribe( "request.error", function( settings, data, status ) {
		deepEqual( data, { data: "is bad" }, "error message: data " );
		equal( status, "custom error", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		deepEqual( data, { data: "is bad" }, "complete message: data " );
		equal( status, "custom error", "complete message: status" );
		start();
	});

	amplify.request({
		resourceId: "test",
		error: function( data, status ) {
			deepEqual( data, { data: "is bad" }, "error callback: data " );
			equal( status, "custom error", "error callback: status" );
		}
	});
});

asyncTest( "prevent request", function() {
	expect( 3 );

	amplify.request.define( "test", function( settings ) {
		deepEqual( settings.data, { pass: true }, "request occurred" );
		start();
	});
	subscribe( "request.before", function( settings ) {
		ok( true, "message published" );
		return settings.data.pass;
	});
	amplify.request( "test", { pass: false } );
	amplify.request( "test", { pass: true } );
});

module( "amplify.request.define - ajax", lifecycle );

asyncTest( "request( id )", function() {
	expect( 23 );

	var url = '/test/request/static/data.json';

	var ajax = $.ajax;
	$.ajax = function( settings ) {
		equal( settings.url, url, "correct url" );
		equal( settings.dataType, "json", "correct dataType" );
		equal( settings.type, "GET", "default type" );
		ajax.apply( this, arguments );
	};
	amplify.request.define( "test", "ajax", {
		url: url,
		dataType: "json"
	});
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "test", "before message: settings.resourceId" );
		deepEqual( settings.data, {}, "before message: settings.data" );
	});
	subscribe( "request.before.ajax", function( resource, settings, ajaxSettings, xhr ) {
		equal( resource.resourceId, "test", "before.ajax message: resource.resourceId" );
		equal( resource.url, url, "before.ajax message: resource.url" );
		equal( resource.dataType, "json", "before.ajax message: resource.dataType" );
		equal( resource.type, "GET", "before.ajax message: resource.type" );
		equal( settings.resourceId, "test", "before.ajax message: settings.resourceId" );
		deepEqual( settings.data, {}, "before.ajax message: settings.data" );
		equal( ajaxSettings.url, url, "before.ajax message: ajaxSettings.url" );
		equal( ajaxSettings.dataType, "json", "before.ajax message: ajaxSettings.dataType" );
		equal( ajaxSettings.type, "GET", "before.ajax message: ajaxSettings.type" );
		ok( "abort" in xhr, "before.ajax message: xhr object provided" );
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( settings.data, {}, "success message: settings.data" );
		deepEqual( data, { foo: "bar" }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, {}, "complete message: settings.data" );
		deepEqual( data, { foo: "bar" }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "test" );
});

asyncTest( "request( id, fn )", function() {
	expect( 10 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json"
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( settings.data, {}, "success message: settings.data" );
		deepEqual( data, { foo: "bar" }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, {}, "complete message: settings.data" );
		deepEqual( data, { foo: "bar" }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	amplify.request( "test", function( data, status ) {
		deepEqual( data, { foo: "bar" }, "success callback: data" );
		equal( status, "success", "success callback: status" );
	});
});

asyncTest( "request( id, data, fn )", function() {
	expect( 10 );
	
	amplify.request.define( "test", "ajax", {
		url: "/test/request/echo",
		dataType: "json",
		type: "POST"
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( settings.data, { open: "source" }, "success message: settings.data" );
		deepEqual( data, { open: "source", echoed: true }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( settings.data, { open: "source" }, "complete message: settings.data" );
		deepEqual( data, { open: "source", echoed: true }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	amplify.request( "test", { open: "source" }, function( data, status ) {
		deepEqual( data, { open: "source", echoed: true }, "success callback: data" );
		equal( status, "success", "success callback: status" );
	});
});

asyncTest( "request( hash ) success", function() {
	expect( 8 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json"
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function( data, status ) {
			deepEqual( data, { foo: "bar" }, "success callback: data" );
			equal( status, "success", "success callback: status" );
		},
		error: function() {
			ok( false, "error callback invoked" );
		}
	});
});

asyncTest( "request( hash ) error", function() {
	expect( 8 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/missing.html",
		dataType: "json"
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: settings.resourceId" );
		deepEqual( data, null, "error message: data" );
		equal( status, "error", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, null, "complete message: data" );
		equal( status, "error", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	amplify.request({
		resourceId: "test",
		error: function( data, status ) {
			deepEqual( data, null, "error callback: data" );
			equal( status, "error", "error callback: status" );
		},
		success: function() {
			ok( false, "success callback invoked" );
		}
	});
});

asyncTest( "prevent request - beforeSend", function() {
	expect( 10 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		// should execute 2 times
		beforeSend: function( xhr, settings ) {
			ok( "abort" in xhr, "xhr object provided" );
			equal( settings.url.substr(0, settings.url.indexOf('=') + 1), "/test/request/static/data.json?pass=", "correct url" );
			equal( settings.dataType, "json", "correct dataType" );
			return settings.url.substring( settings.url.length - 4 ) === "true";
		}
	});
	// should execute 2 times
	subscribe( "request.before", function( settings ) {
		ok( true, "before message published" );
	});
	// should execute 1 time
	subscribe( "request.before.ajax", function( settings ) {
		ok( true, "before.ajax message published" );
	});
	// should execute 1 time
	subscribe( "request.complete", function( settings ) {
		ok( settings.data.pass, "request completed" );
		start();
	});
	amplify.request( "test", { pass: false } );
	amplify.request( "test", { pass: true } );
});

asyncTest( "prevent request - request.before", function() {
	expect( 4 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json"
	});
	subscribe( "request.before", function( settings ) {
		ok( true, "message published" );
		return settings.data.pass;
	});
	subscribe( "request.complete", function( settings, data, status ) {
		if ( !settings.data.pass ) {
			equal( status, "abort", "aborted" );
		} else {
			equal( status, "success", "successful" );
			start();
		}
	});
	amplify.request( "test", { pass: false } );
	amplify.request( "test", { pass: true } );
});

asyncTest( "prevent request - request.before.ajax", function() {
	expect( 3 );
	
	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json"
	});
	subscribe( "request.before.ajax", function( resouce, settings ) {
		ok( true, "message published" );
		return settings.data.pass;
	});
	subscribe( "request.complete", function( settings, data, status ) {
		if ( !settings.data.pass ) {
			equal( status, "abort", "aborted" );
		} else {
			equal( status, "success", "successful" );
			start();
		}
	});
	amplify.request( "test", { pass: false } );
	amplify.request( "test", { pass: true } );
});

test( "data merging", function() {
	expect( 3 );

	$.ajax = function( settings ) {
		deepEqual( settings.data, {
			foo: "bar",
			bar: "baz",
			baz: "qux"
		}, "default data passed through" );
	};
	amplify.request.define( "test", "ajax", {
		url: "",
		data: {
			foo: "bar",
			bar: "baz",
			baz: "qux"
		}
	});
	amplify.request( "test" );
	amplify.request( "test", {} );

	$.ajax = function( settings ) {
		deepEqual( settings.data, {
			foo: "changed",
			bar: "baz",
			baz: {
				qux: "remains",
				quux: "is changed"
			}
		}, "data merged" );
	};
	amplify.request.define( "test", "ajax", {
		url: "",
		data: {
			foo: "bar",
			bar: "baz",
			baz: {
				qux: "remains",
				quux: "changes"
			}
		}
	});
	amplify.request( "test", {
		foo: "changed",
		baz: {
			quux: "is changed"
		}
	});
});

test( "url substitution", function() {
	expect( 7 );

	$.ajax = function( settings ) {
		equal( settings.url, "/path/bar", "url" );
		deepEqual( settings.data, {}, "data" );
	};
	amplify.request.define( "test", "ajax", {
		url: "/path/{foo}",
		data: {
			foo: "bar"
		}
	});
	amplify.request( "test" );

	$.ajax = function( settings ) {
		equal( settings.url, "/path/qux", "url" );
		deepEqual( settings.data, {}, "data" );
	};
	amplify.request( "test", { foo: "qux" } );

	$.ajax = function( settings ) {
		equal( settings.url, "/path/bar", "url" );
		deepEqual( settings.data, { qux: "quux" }, "data" );
	};
	amplify.request( "test", { qux: "quux" } );

	$.ajax = function( settings ) {
		equal( settings.url, "/a/bar/b/bar", "url" );
	};
	amplify.request.define( "test", "ajax", {
		url: "/a/{foo}/b/{foo}"
	});
	amplify.request( "test", { foo: "bar" } );
});

asyncTest( "data as string", function() {
	expect( 1 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/echoraw",
		type: "POST"
	});
	amplify.request( "test", "sending {raw} [data]", function( data ) {
		equal( data, "sending {raw} [data]" );
		start();
	});
});

test( "dataMap: hash", function() {
	expect( 1 );

	$.ajax = function( settings ) {
		deepEqual( settings.data, {
			sillyNameForFoo: "foo val",
			bar: "bar val"
		}, "keys mapped" );
	};
	amplify.request.define( "test", "ajax", {
		url: "",
		dataMap: {
			foo: "sillyNameForFoo",
			baz: "sillyNameForBaz"
		}
	});
	amplify.request( "test", {
		foo: "foo val",
		bar: "bar val"
	});
});

test( "dataMap: function", function() {
	expect( 2 );

	$.ajax = function( settings ) {
		deepEqual( settings.data, {
			foo: "bar",
			baz: "qux"
		}, "keys mapped" );
	};
	amplify.request.define( "test", "ajax", {
		url: "",
		dataMap: function( data ) {
			deepEqual( data, {
				orig: "data"
			}, "original data in dataMap" );

			return {
				foo: "bar",
				baz: "qux"
			};
		}
	});
	amplify.request( "test", {
		orig: "data"
	});
});

asyncTest( "abort", function() {
	expect( 9 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/delay",
		dataType: "json",
		cache: false
	});
	var request = amplify.request({
		resourceId: "test",
		error: function( data, status ) {
			deepEqual( data, null, "error callback: data" );
			equal( status, "abort", "error callback: status" );
		},
		success: function() {
			ok( false, "success callback invoked" );
		}
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: resourceId" );
		deepEqual( data, null, "error message: data" );
		equal( status, "abort", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: resourceId" );
		deepEqual( data, null, "complete message: data" );
		equal( status, "abort", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	ok( "abort" in request, "request object has abort method" );
	request.abort();
	// make sure calling abort() multiple times does nothing
	// tested via expected number of assertions
	request.abort();
});

asyncTest( "ampXHR", function() {
	expect( 7 );

	var ampXHR;
	amplify.request.define( "ampXHR", "ajax", {
		// prevent caching to ensure we get proper headers
		cache: false,
		url: "/test/request/headers",
		dataType: "json"
	});
	subscribe( "request.before.ajax", function( resource, settings, ajaxSettings, xhr ) {
		ampXHR = xhr;
		ampXHR.setRequestHeader( "X-Amplify-Request", "custom request header" );
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( ampXHR.readyState, 4, "ampXHR.readyState" );
		deepEqual( data, { header: "custom request header" }, "ampXHR.setRequestHeader()" );
		equal( ampXHR.getResponseHeader( "X-Amplify-Response" ), "custom response header",
			"ampXHR.getResponseHeader()" );
		ok( ampXHR.getAllResponseHeaders().toLowerCase().indexOf(
			"x-amplify-response: custom response header" ) !== -1,
			"ampXHR.getAllResponseHeaders()" );
		equal( ampXHR.status, 200, "ampXHR.status" );
		equal( ampXHR.statusText, "success", "ampXHR.statusText" );
		equal( ampXHR.responseText, JSON.stringify({header: "custom request header"}),
			"ampXHR.responseText" );
	});
	subscribe( "request.complete", function() {
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "ampXHR" );
});

test( "cache keys", function() {
	expect( 2 );

	equal( amplify.request.cache._key( "x", "" ), "request-x-1996950016" );
	equal( amplify.request.cache._key( "x", "foo=bar" ), "request-x-50601290" );
});

asyncTest( "cache: true", function() {
	expect( 14 );

	var ajaxCalls = 0;
	$( "#ajax-listener" ).ajaxComplete(function( event, xhr ) {
		if ( !(/^(abort|canceled)$/).test( xhr.statusText ) ) {
			ok( !(ajaxCalls++), "ajax call completed" );
		}
	});
	amplify.request.define( "memory-cache", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		cache: true
	});
	// should execute for both requests
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "memory-cache", "before message: settings.resourceId" );
	});
	// should execute for first request only
	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "memory-cache", "before.ajax message: resource.resourceId" );
	});
	// should execute for both requests
	subscribe( "request.success", function( settings, data ) {
		equal( settings.resourceId, "memory-cache", "success message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "success message: data" );
	});
	// should execute for both requests
	subscribe( "request.complete", function( settings, data ) {
		equal( settings.resourceId, "memory-cache", "complete message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "complete message: data" );
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "memory-cache", function( data ) {
		deepEqual( data, { foo: "bar" }, "first request callback" );
		amplify.request( "memory-cache", function( data ) {
			deepEqual( data, { foo: "bar" }, "second request callback" );
			start();
		});
	});
});

asyncTest( "cache with data", function() {
	expect( 8 );

	var expectAjax = true;
	amplify.request.define( "data-cache", "ajax", {
		url: "/test/request/echoraw",
		cache: true
	});
	subscribe( "request.before.ajax", function() {
		ok( expectAjax );
	});
	amplify.request( "data-cache", function( data ) {
		equal( data, "empty", "no data; empty cache" );
		amplify.request( "data-cache", { foo: "bar" }, function( data ) {
			equal( data, "foo=bar", "data; empty cache" );
			amplify.request( "data-cache", { foo: "qux" }, function( data ) {
				equal( data, "foo=qux", "different data; empty cache" );
				expectAjax = false;
				amplify.request( "data-cache", { foo: "bar" }, function( data ) {
					equal( data, "foo=bar", "data; cached" );
					amplify.request( "data-cache", function( data ) {
						equal( data, "empty", "no data; cached" );
						start();
					});
				});
			});
		});
	});
});

asyncTest( "cache with data-replaced URL", function() {
	expect( 5 );

	var expectAjax = true;
	amplify.request.define( "data-cache-url", "ajax", {
		url: "/test/request/echoraw?{foo}",
		cache: true
	});
	subscribe( "request.before.ajax", function() {
		ok( expectAjax );
	});
	amplify.request( "data-cache-url", { foo: "bar" }, function( data ) {
		equal( data, "bar", "data; empty cache" );
		amplify.request( "data-cache-url", { foo: "qux" }, function( data ) {
			equal( data, "qux", "different data; empty cache" );
			expectAjax = false;
			amplify.request( "data-cache-url", { foo: "bar" }, function( data ) {
				equal( data, "bar", "data; cached" );
				start();
			});
		});
	});
});

asyncTest( "cache: Number", function() {
	expect( 22 );

	var shouldCache = false;
	$( "#ajax-listener" ).ajaxComplete(function( event, xhr ) {
		if ( !(/^(abort|canceled)$/).test( xhr.statusText ) ) {
			ok( !shouldCache, "ajax call completed" );
		}
	});
	amplify.request.define( "cache-duration", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		cache: 500
	});
	// should execute for 3 requests
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "cache-duration", "before message: settings.resourceId" );
	});
	// should execute for 2 requests
	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "cache-duration", "before.ajax message: resource.resourceId" );
	});
	// should execute for 3 requests
	subscribe( "request.success", function( settings, data ) {
		equal( settings.resourceId, "cache-duration", "success message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "success message: data" );
	});
	// should execute for 3 requests
	subscribe( "request.complete", function( settings, data ) {
		equal( settings.resourceId, "cache-duration", "complete message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "complete message: data" );
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "cache-duration", function( data ) {
		// delay setting the flag because the success callback will be invoked
		// before the ajaxComplete event is triggered
		setTimeout(function() {
			shouldCache = true;
		}, 1 );
		deepEqual( data, { foo: "bar" }, "first request callback" );
		amplify.request( "cache-duration", function( data ) {
			deepEqual( data, { foo: "bar" }, "second request callback" );
		});
		setTimeout(function() {
			shouldCache = false;
			amplify.request( "cache-duration", function( data ) {
				deepEqual( data, { foo: "bar" }, "third request callback" );
				start();
			});
		}, 700 );
	});
});

asyncTest( "cache: persist - no expires", function() {
	expect( 15 );

	var ajaxCalls = 0;
	$( "#ajax-listener" ).ajaxComplete(function( event, xhr ) {
		if ( !(/^(abort|canceled)$/).test( xhr.statusText ) ) {
			ok( !(ajaxCalls++), "ajax call completed" );
		}
	});
	amplify.request.define( "persist-cache", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		cache: "persist"
	});
	// should execute for both requests
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "persist-cache", "before message: settings.resourceId" );
	});
	// should execute for first request only
	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "persist-cache", "before.ajax message: resource.resourceId" );
		equal( resource.cache.expires, undefined, "before.ajax message: resource.expires");
	});
	// should execute for both requests
	subscribe( "request.success", function( settings, data ) {
		equal( settings.resourceId, "persist-cache", "success message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "success message: data" );
	});
	// should execute for both requests
	subscribe( "request.complete", function( settings, data ) {
		equal( settings.resourceId, "persist-cache", "complete message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "complete message: data" );
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request( "persist-cache", function( data ) {
		deepEqual( data, { foo: "bar" }, "first request callback" );
		amplify.request( "persist-cache", function( data ) {
			deepEqual( data, { foo: "bar" }, "second request callback" );
			start();
		});
	});
});

asyncTest( "cache: persist - expires", function() {
	expect( 24 );

	var shouldCache = false;
	$( "#ajax-listener" ).ajaxComplete(function( event, xhr ) {
		if ( !(/^(abort|canceled)$/).test( xhr.statusText ) ) {
			ok( !shouldCache, "ajax call completed" );
		}
	});

	amplify.request.define( "persist-cache", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		cache: { type: "persist", expires: 450 }
	});

	// should execute for 3 requests
	subscribe( "request.before", function( settings ) {
		equal( settings.resourceId, "persist-cache", "before message: settings.resourceId" );
	});
	// should execute for 2 requests
	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "persist-cache", "before.ajax message: resource.resourceId" );
		equal( resource.cache.expires, 450, "before.ajax message: resource.expires");
	});
	// should execute 3 requests
	subscribe( "request.success", function( settings, data ) {
		equal( settings.resourceId, "persist-cache", "success message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "success message: data" );
	});
	// should execute for 3 requests
	subscribe( "request.complete", function( settings, data ) {
		equal( settings.resourceId, "persist-cache", "complete message: settings.resourceId" );
		deepEqual( data, { foo: "bar" }, "complete message: data" );
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});

	amplify.request( "persist-cache", function( data ) {
		// delay setting the flag because the success callback will be invoked
		// before the ajaxComplete event is triggered
		setTimeout(function() {
			shouldCache = true;
		}, 1 );
		deepEqual( data, { foo: "bar" }, "first request callback" );
		amplify.request( "persist-cache", function( data ) {
			deepEqual( data, { foo: "bar" }, "second request callback" );
		});
		setTimeout(function() {
			shouldCache = false;
			amplify.request( "persist-cache", function( data ) {
				deepEqual( data, { foo: "bar" }, "third request callback" );
				start();
			});
		}, 500 );
	});
});

test( "cache types", function() {
	$.each( amplify.store.types, function( type ) {
		ok( type in amplify.request.cache, type );
	});
});

asyncTest( "cache: jsonp without cache should be left alone", function () {
	expect(7);

	amplify.request.define( "jsonp-cache", "ajax", {
		url: "/test/request/jsonp",
		dataType: "jsonp"
	});

	var timesAjaxTriggered = 0;

	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "jsonp-cache", "before.ajax message: resource.resourceId" );
		timesAjaxTriggered += 1;
	});

	subscribe( "request.error", function(settings, data, status) {
		ok(false, "error message published: " + status);
	});

	var expectedData = {foo: 'bar'};

	amplify.request( "jsonp-cache", function( actualData ) {
		deepEqual( actualData, expectedData, "first request callback" );
		amplify.request( "jsonp-cache", function( actualData ) {
			deepEqual( actualData, expectedData, "second request callback" );
			amplify.request('jsonp-cache', function (actualData) {
				deepEqual(actualData, expectedData, "third request callback" );
				equal(timesAjaxTriggered, 3, 'ajax should have been triggered three times');
				start();
			});
		});
	});
});

asyncTest( "cache: jsonp with auto-generated callback", function () {
	expect(5);

	amplify.request.define( "jsonp-cache", "ajax", {
		url: "/test/request/jsonp",
		dataType: "jsonp",
		cache: { type: "persist", expires: 450 }
	});

	var timesAjaxTriggered = 0;

	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "jsonp-cache", "before.ajax message: resource.resourceId" );
		timesAjaxTriggered += 1;
	});

	subscribe( "request.error", function(settings, data, status) {
		ok(false, "error message published: " + status);
	});

	var expectedData = {foo: 'bar'};

	amplify.request( "jsonp-cache", function( actualData ) {
		deepEqual( actualData, expectedData, "first request callback" );
		amplify.request( "jsonp-cache", function( actualData ) {
			deepEqual( actualData, expectedData, "first request callback" );
			amplify.request('jsonp-cache', function (actualData) {
				deepEqual(actualData, expectedData, "third request callback" );
				equal(timesAjaxTriggered, 1, 'ajax should have been triggered once');
				start();
			});
		});
	});
});

asyncTest( "cache: jsonp with custom callback key and function", function () {
	expect(5);

	amplify.request.define( "jsonp-cache", "ajax", {
		url: "/test/request/jsonp/custom_key?custom_key=custom_function",
		dataType: "jsonp",
		jsonp: false,
		jsonpCallback: 'custom_function',
		cache: { type: "persist", expires: 450 }
	});

	var timesAjaxTriggered = 0;

	subscribe( "request.before.ajax", function( resource ) {
		console.log('before');
		equal( resource.resourceId, "jsonp-cache", "before.ajax message: resource.resourceId" );
		timesAjaxTriggered += 1;
	});

	subscribe( "request.error", function(settings, data, status) {
		console.log('error', status);
		ok(false, "error message published: " + status);
	});

	var expectedData = {foo: 'bar'};

	amplify.request( "jsonp-cache", function( actualData ) {
		deepEqual( actualData, expectedData, "first request callback" );
		amplify.request( "jsonp-cache", function( actualData ) {
			deepEqual( actualData, expectedData, "first request callback" );
			amplify.request('jsonp-cache', function (actualData) {
				deepEqual(actualData, expectedData, "third request callback" );
				equal(timesAjaxTriggered, 1, 'ajax should have been triggered once');
				start();
			});
		});
	});
});

asyncTest( "cache: jsonp with `jsonp` parameter defining specific callback key with auto-generated callback function", function () {
	expect(5);

	var callbackKey = 'call_back_key';

	amplify.request.define( "jsonp-cache", "ajax", {
		url: "/test/request/jsonp/" + callbackKey,
		dataType: "jsonp",
		jsonp: callbackKey,
		cache: { type: "persist", expires: 450 }
	} );

	var timesAjaxTriggered = 0;

	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "jsonp-cache", "before.ajax message: resource.resourceId" );
		timesAjaxTriggered += 1;
	});

	subscribe( "request.error", function(settings, data, status) {
		ok(false, "error message published: " + status);
	});

	var expectedData = {foo: 'bar'};

	amplify.request( "jsonp-cache", function( actualData ) {
		deepEqual( actualData, expectedData, "first request callback" );
		amplify.request( "jsonp-cache", function( actualData ) {
			deepEqual( actualData, expectedData, "first request callback" );
			amplify.request('jsonp-cache', function (actualData) {
				deepEqual(actualData, expectedData, "third request callback" );
				equal(timesAjaxTriggered, 1, 'ajax should have been triggered once');
				start();
			});
		});
	});
});

asyncTest( "cache: jsonp with `jsonpCallback` parameter defining specific callback function with default callback key", function () {
	expect(5);

	var callbackFunctionName = 'cb1234567890_0987654321';

	amplify.request.define( "jsonp-cache", "ajax", {
		url: "/test/request/jsonp",
		dataType: "jsonp",
		jsonpCallback: callbackFunctionName,
		cache: { type: "persist", expires: 450 }
	});

	var timesAjaxTriggered = 0;

	subscribe( "request.before.ajax", function( resource ) {
		equal( resource.resourceId, "jsonp-cache", "before.ajax message: resource.resourceId" );
		timesAjaxTriggered += 1;
	});

	subscribe( "request.error", function(settings, data, status) {
		ok(false, "error message published: " + status);
	});

	var expectedData = {foo: 'bar'};

	amplify.request( "jsonp-cache", function( actualData ) {
		deepEqual( actualData, expectedData, "first request callback" );
		amplify.request( "jsonp-cache", function( actualData ) {
			deepEqual( actualData, expectedData, "first request callback" );
			amplify.request('jsonp-cache', function (actualData) {
				deepEqual(actualData, expectedData, "third request callback" );
				equal(timesAjaxTriggered, 1, 'ajax should have been triggered once');
				start();
			});
		});
	});
});

asyncTest( "decoder: Function - success", function() {
	expect( 11 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		decoder: function( data, status, xhr, success, error ) {
			deepEqual( data, { foo: "bar" }, "data in decoder" );
			equal( status, "success", "status in decoder" );
			ok( "abort" in xhr, "xhr in decoder" );
			success({ baz: "qux" });
		}
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( data, { baz: "qux" }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { baz: "qux" }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function( data, status ) {
			deepEqual( data, { baz: "qux" }, "success callback: data" );
			equal( status, "success", "success callback: status" );
		},
		error: function() {
			ok( false, "error callback invoked" );
		}
	});
});

asyncTest( "decoder: Function - error", function() {
	expect( 11 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		decoder: function( data, status, xhr, success, error ) {
			deepEqual( data, { foo: "bar" }, "data in decoder" );
			equal( status, "success", "status in decoder" );
			ok( "abort" in xhr, "xhr in decoder" );
			error({ baz: "qux" });
		}
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: settings.resourceId" );
		deepEqual( data, { baz: "qux" }, "error message: data" );
		equal( status, "error", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { baz: "qux" }, "complete message: data" );
		equal( status, "error", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function() {
			ok( false, "success callback invoked" );
		},
		error: function( data, status ) {
			deepEqual( data, { baz: "qux" }, "error callback: data" );
			equal( status, "error", "error callback: status" );
		}
	});
});

asyncTest( "decoder: jsend - success", function() {
	expect( 8 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/jsend.json",
		dataType: "json",
		decoder: "jsend"
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( data, { unwrapped: true }, "success message: data" );
		equal( status, "success", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { unwrapped: true }, "complete message: data" );
		equal( status, "success", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function( data, status ) {
			deepEqual( data, { unwrapped: true }, "success callback: data" );
			equal( status, "success", "success callback: status" );
		},
		error: function() {
			ok( false, "error callback invoked" );
		}
	});
});

asyncTest( "decoder: jsend - fail", function() {
	expect( 8 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/jsend-fail.json",
		dataType: "json",
		decoder: "jsend"
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: settings.resourceId" );
		deepEqual( data, { broken: true }, "error message: data" );
		equal( status, "fail", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { broken: true }, "complete message: data" );
		equal( status, "fail", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function() {
			ok( false, "success callback invoked" );
		},
		error: function( data, status ) {
			deepEqual( data, { broken: true }, "error callback: data" );
			equal( status, "fail", "error callback: status" );
		}
	});
});

asyncTest( "decoder: jsend - error", function() {
	expect( 8 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/jsend-error.json",
		dataType: "json",
		decoder: "jsend"
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: settings.resourceId" );
		deepEqual( data, { message: "it broke" }, "error message: data" );
		equal( status, "error", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { message: "it broke" }, "complete message: data" );
		equal( status, "error", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function() {
			ok( false, "success callback invoked" );
		},
		error: function( data, status ) {
			deepEqual( data, { message: "it broke" }, "error callback: data" );
			equal( status, "error", "error callback: status" );
		}
	});
});

asyncTest( "decoder: jsend - error with details", function() {
	expect( 8 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/jsend-error2.json",
		dataType: "json",
		decoder: "jsend"
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: settings.resourceId" );
		deepEqual( data, {
			message: "it broke",
			code: 15,
			data: { you: "broke", it: "bad" }
		}, "error message: data" );
		equal( status, "error", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, {
			message: "it broke",
			code: 15,
			data: { you: "broke", it: "bad" }
		}, "complete message: data" );
		equal( status, "error", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function() {
			ok( false, "success callback invoked" );
		},
		error: function( data, status ) {
			deepEqual( data, {
				message: "it broke",
				code: 15,
				data: { you: "broke", it: "bad" }
			}, "error callback: data" );
			equal( status, "error", "error callback: status" );
		}
	});
});

asyncTest( "decoder: jsend - invalid reponse", function() {
	expect( 8 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		decoder: "jsend"
	});
	subscribe( "request.error", function( settings, data, status ) {
		equal( settings.resourceId, "test", "error message: settings.resourceId" );
		strictEqual( data, null, "error message: data" );
		equal( status, "error", "error message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		strictEqual( data, null, "complete message: data" );
		equal( status, "error", "complete message: status" );
		start();
	});
	subscribe( "request.success", function() {
		ok( false, "success message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function() {
			ok( false, "success callback invoked" );
		},
		error: function( data, status ) {
			strictEqual( data, null, "error callback: data" );
			equal( status, "error", "error callback: status" );
		}
	});
});

asyncTest( "decoder: custom", function() {
	expect( 11 );

	amplify.request.decoders.silly = function( data, status, xhr, success, error ) {
		deepEqual( data, { foo: "bar" }, "data in decoder" );
		equal( status, "success", "status in decoder" );
		ok( "abort" in xhr, "xhr in decoder" );
		var sillyData = {};
		$.each( data, function( key, value ) {
			sillyData[ "silly-" + key ] = value;
		});
		success( sillyData, "silly" );
	};
	amplify.request.define( "test", "ajax", {
		url: "/test/request/static/data.json",
		dataType: "json",
		decoder: "silly"
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( data, { "silly-foo": "bar" }, "success message: data" );
		equal( status, "silly", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { "silly-foo": "bar" }, "complete message: data" );
		equal( status, "silly", "complete message: status" );
		start();
		delete amplify.request.decoders.silly;
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function( data, status ) {
			deepEqual( data, { "silly-foo": "bar" }, "success callback: data" );
			equal( status, "silly", "success callback: status" );
		},
		error: function() {
			ok( false, "error callback invoked" );
		}
	});
});

asyncTest( "decoder: jsonp", function() {
	expect( 11 );

	amplify.request.define( "test", "ajax", {
		url: "/test/request/jsonp",
		dataType: "jsonp",
		decoder: function( data, status, xhr, success, error ) {
			deepEqual( data, { foo: "bar" }, "data in decoder" );
			equal( status, "success", "status in decoder" );
			ok( "abort" in xhr, "xhr in decoder" );
			var decodedData = {};
			$.each( data, function( key, value ) {
				decodedData[ "decoded-" + key ] = value;
			});
			success( decodedData, "decoded-jsonp" );
		}
	});
	subscribe( "request.success", function( settings, data, status ) {
		equal( settings.resourceId, "test", "success message: settings.resourceId" );
		deepEqual( data, { "decoded-foo": "bar" }, "success message: data" );
		equal( status, "decoded-jsonp", "success message: status" );
	});
	subscribe( "request.complete", function( settings, data, status ) {
		equal( settings.resourceId, "test", "complete message: settings.resourceId" );
		deepEqual( data, { "decoded-foo": "bar" }, "complete message: data" );
		equal( status, "decoded-jsonp", "complete message: status" );
		start();
	});
	subscribe( "request.error", function() {
		ok( false, "error message published" );
	});
	amplify.request({
		resourceId: "test",
		success: function( data, status ) {
			deepEqual( data, { "decoded-foo": "bar" }, "success callback: data" );
			equal( status, "decoded-jsonp", "success callback: status" );
		},
		error: function() {
			ok( false, "error callback invoked" );
		}
	});
});

}());
