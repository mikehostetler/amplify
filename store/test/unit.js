module( "amplify.store" );

test( "amplify.store.addType", function() {
	expect( 10 );
	var testStore,
		store = function( key, value ) {
			return testStore.apply( this, arguments );
		};
	amplify.store.addType( "custom", store );
	equal( amplify.store.types.custom, store, "custom store added" );

	testStore = function( key, value ) {
		equal( key, "foo", "getter key" );
		equal( value, undefined, "getter value" );
		return "bar";
	};
	equal( amplify.store.custom( "foo" ), "bar", "getter" );
	testStore = function( key, value ) {
		equal( key, "foo", "setter key" );
		equal( value, "baz", "setter value" );
		return value;
	};
	equal( amplify.store.custom( "foo", "baz" ), "baz", "setter" );
	equal( amplify.store( "foo", "baz", { type: "custom" } ), "baz",
		"setter via options" );
});

if ( "localStorage" in amplify.store.types ) {
	module( "amplify.store.localStorage", {
		setup: function() {
			localStorage.clear();
		}
	});

	test( "localStorage", function() {
		expect( 9 );
		deepEqual( amplify.store.localStorage(), {}, "empty store" );
		equal( amplify.store.localStorage( "foo" ), undefined, "get; miss" );
		equal( amplify.store.localStorage( "foo", "bar" ), "bar", "set" );
		equal( amplify.store.localStorage( "foo" ), "bar", "get" );
		deepEqual( amplify.store.localStorage( "baz", { qux: "quux" } ),
			{ qux: "quux" }, "set object" );
		deepEqual( amplify.store.localStorage( "baz" ), { qux: "quux" }, "get object" );
		deepEqual( amplify.store.localStorage(),
			{ foo: "bar", baz: { qux: "quux" } }, "get all" );
		equal( amplify.store.localStorage( "foo", null ), null, "delete" );
		equal( amplify.store.localStorage( "foo" ), undefined, "deleted" );
	});

	asyncTest( "localStorage expiration", function() {
		expect( 5 );
		amplify.store.localStorage( "forever", "not really", { expires: 100 } );
		amplify.store.localStorage( "forever", "and ever" );
		amplify.store.localStorage( "expiring1", "i disappear",
			{ expires: 500 } );
		amplify.store.localStorage( "expiring2", "i disappear too",
			{ expires: 1000 } );
		deepEqual( amplify.store.localStorage(), {
			forever: "and ever",
			expiring1: "i disappear",
			expiring2: "i disappear too"
		}, "all values exist" );
		setTimeout(function() {
			deepEqual( amplify.store.localStorage(), {
				forever: "and ever",
				expiring2: "i disappear too"
			}, "500 expired, others exist" );
			equal( amplify.store.localStorage( "expiring1" ), undefined,
				"500 expired" );
			equal( amplify.store.localStorage( "expiring2" ), "i disappear too",
			"1000 still valid" );
		}, 750 );
		setTimeout(function() {
			deepEqual( amplify.store.localStorage(), { forever: "and ever" }, "both expired" );
			start();
		}, 1250 );
	});

	test( "localStorage multi-page", function() {
		expect( 1 );
		var iframe = document.getElementById( "other-page" ),
			otherAmplify = (iframe.contentWindow || iframe.contentDocument.defaultView).amplify;
		amplify.store.localStorage( "foo", "bar" );
		otherAmplify.store.localStorage( "baz", "qux" );
		deepEqual( amplify.store.localStorage(), {
			foo: "bar",
			baz: "qux"
		}, "both exist in current page" );
	});
}

if ( "sessionStorage" in amplify.store.types ) {
	module( "amplify.store.sessionStorage", {
		setup: function() {
			try {
				sessionStorage.clear();
			} catch ( error ) {
				var key;
				try {
					while ( key = sessionStorage.key( 0 ) ) {
						sessionStorage.removeItem( key );
					}
				} catch( error ) {}
			}
		}
	});

	test( "sessionStorage", function() {
		expect( 9 );
		deepEqual( amplify.store.sessionStorage(), {}, "empty store" );
		equal( amplify.store.sessionStorage( "foo" ), undefined, "get; miss" );
		equal( amplify.store.sessionStorage( "foo", "bar" ), "bar", "set" );
		equal( amplify.store.sessionStorage( "foo" ), "bar", "get" );
		deepEqual( amplify.store.sessionStorage( "baz", { qux: "quux" } ),
				{ qux: "quux" }, "set object" );
		deepEqual( amplify.store.sessionStorage( "baz" ), { qux: "quux" }, "get object" );
		deepEqual( amplify.store.sessionStorage(),
				{ foo: "bar", baz: { qux: "quux" } }, "get all" );
		equal( amplify.store.sessionStorage( "foo", null ), null, "delete" );
		equal( amplify.store.sessionStorage( "foo" ), undefined, "deleted" );
	});

	asyncTest( "sessionStorage expiration", function() {
		expect( 5 );
		amplify.store.sessionStorage( "forever", "not really", { expires: 100 } );
		amplify.store.sessionStorage( "forever", "and ever" );
		amplify.store.sessionStorage( "expiring1", "i disappear",
			{ expires: 500 } );
		amplify.store.sessionStorage( "expiring2", "i disappear too",
			{ expires: 1000 } );
		deepEqual( amplify.store.sessionStorage(), {
			forever: "and ever",
			expiring1: "i disappear",
			expiring2: "i disappear too"
		}, "all values exist" );
		setTimeout(function() {
			deepEqual( amplify.store.sessionStorage(), {
				forever: "and ever",
				expiring2: "i disappear too"
			}, "500 expired, others exist" );
			equal( amplify.store.sessionStorage( "expiring1" ), undefined,
				"500 expired" );
			equal( amplify.store.sessionStorage( "expiring2" ), "i disappear too",
			"1000 still valid" );
		}, 750 );
		setTimeout(function() {
			deepEqual( amplify.store.sessionStorage(), { forever: "and ever" }, "both expired" );
			start();
		}, 1250 );
	});

	test( "sessionStorage multi-page", function() {
		expect( 1 );
		var iframe = document.getElementById( "other-page" ),
			otherAmplify = (iframe.contentWindow || iframe.contentDocument.defaultView).amplify;
		amplify.store.sessionStorage( "foo", "bar" );
		otherAmplify.store.sessionStorage( "baz", "qux" );
		deepEqual( amplify.store.sessionStorage(), {
			foo: "bar",
			baz: "qux"
		}, "both exist in current page" );
	});
}

if ( "globalStorage" in amplify.store.types ) {
	module( "amplify.store.globalStorage", {
		setup: function() {
			var key,
				store = globalStorage[ location.hostname ];
			try {
				while ( key = store.key( 0 ) ) {
					store.removeItem( key );
				}
			} catch( error ) {}
		}
	});

	test( "globalStorage", function() {
		expect( 9 );
		deepEqual( amplify.store.globalStorage(), {}, "empty store" );
		equal( amplify.store.globalStorage( "foo" ), undefined, "get; miss" );
		equal( amplify.store.globalStorage( "foo", "bar" ), "bar", "set" );
		equal( amplify.store.globalStorage( "foo" ), "bar", "get" );
		deepEqual( amplify.store.globalStorage( "baz", { qux: "quux" } ),
			{ qux: "quux" }, "set object" );
		deepEqual( amplify.store.globalStorage( "baz" ), { qux: "quux" }, "get object" );
		deepEqual( amplify.store.globalStorage(),
			{ foo: "bar", baz: { qux: "quux" } }, "get all" );
		equal( amplify.store.globalStorage( "foo", null ), null, "delete" );
		equal( amplify.store.globalStorage( "foo" ), undefined, "deleted" );
	});

	asyncTest( "globalStorage expiration", function() {
		expect( 5 );
		amplify.store.globalStorage( "forever", "not really", { expires: 100 } );
		amplify.store.globalStorage( "forever", "and ever" );
		amplify.store.globalStorage( "expiring1", "i disappear",
			{ expires: 500 } );
		amplify.store.globalStorage( "expiring2", "i disappear too",
			{ expires: 1000 } );
		deepEqual( amplify.store.globalStorage(), {
			forever: "and ever",
			expiring1: "i disappear",
			expiring2: "i disappear too"
		}, "all values exist" );
		setTimeout(function() {
			deepEqual( amplify.store.globalStorage(), {
				forever: "and ever",
				expiring2: "i disappear too"
			}, "500 expired, others exist" );
			equal( amplify.store.globalStorage( "expiring1" ), undefined,
				"500 expired" );
			equal( amplify.store.globalStorage( "expiring2" ), "i disappear too",
			"1000 still valid" );
		}, 750 );
		setTimeout(function() {
			deepEqual( amplify.store.globalStorage(), { forever: "and ever" }, "both expired" );
			start();
		}, 1250 );
	});

	test( "globalStorage multi-page", function() {
		expect( 1 );
		var iframe = document.getElementById( "other-page" ),
			otherAmplify = (iframe.contentWindow || iframe.contentDocument.defaultView).amplify;
		amplify.store.globalStorage( "foo", "bar" );
		otherAmplify.store.globalStorage( "baz", "qux" );
		deepEqual( amplify.store.globalStorage(), {
			foo: "bar",
			baz: "qux"
		}, "both exist in current page" );
	});
}

if ( "userData" in amplify.store.types ) {
	module( "amplify.store.userData", {
		setup: function() {
			var attr,
				div = document.createElement( "div" );
			document.body.appendChild( div );
			div.addBehavior( "#default#userdata" );
			div.load( "amplify" );
			while ( attr = div.XMLDocument.documentElement.attributes[ 0 ] ) {
				div.removeAttribute( attr.name );
			}
			div.save( "amplify" );
		}
	});

	test( "userData", function() {
		expect( 9 );
		deepEqual( amplify.store.userData(), {}, "empty store" );
		equal( amplify.store.userData( "foo" ), undefined, "get; miss" );
		equal( amplify.store.userData( "foo", "bar" ), "bar", "set" );
		equal( amplify.store.userData( "foo" ), "bar", "get" );
		deepEqual( amplify.store.userData( "baz", { qux: "quux" } ),
			{ qux: "quux" }, "set object" );
		deepEqual( amplify.store.userData( "baz" ), { qux: "quux" }, "get object" );
		deepEqual( amplify.store.userData(),
			{ foo: "bar", baz: { qux: "quux" } }, "get all" );
		equal( amplify.store.userData( "foo", null ), null, "delete" );
		equal( amplify.store.userData( "foo" ), undefined, "deleted" );
	});

	asyncTest( "userData expiration", function() {
		expect( 5 );
		amplify.store.userData( "forever", "not really", { expires: 100 } );
		amplify.store.userData( "forever", "and ever" );
		amplify.store.userData( "expiring1", "i disappear",
			{ expires: 500 } );
		amplify.store.userData( "expiring2", "i disappear too",
			{ expires: 1000 } );
		deepEqual( amplify.store.userData(), {
			forever: "and ever",
			expiring1: "i disappear",
			expiring2: "i disappear too"
		}, "all values exist" );
		setTimeout(function() {
			deepEqual( amplify.store.userData(), {
				forever: "and ever",
				expiring2: "i disappear too"
			}, "500 expired, others exist" );
			equal( amplify.store.userData( "expiring1" ), undefined,
				"500 expired" );
			equal( amplify.store.userData( "expiring2" ), "i disappear too",
			"1000 still valid" );
		}, 750 );
		setTimeout(function() {
			deepEqual( amplify.store.userData(), { forever: "and ever" }, "both expired" );
			start();
		}, 1250 );
	});

	test( "userData multi-page", function() {
		expect( 1 );
		var iframe = document.getElementById( "other-page" ),
			otherAmplify = (iframe.contentWindow || iframe.contentDocument.defaultView).amplify;
		amplify.store.userData( "foo", "bar" );
		otherAmplify.store.userData( "baz", "qux" );
		deepEqual( amplify.store.userData(), {
			foo: "bar",
			baz: "qux"
		}, "both exist in current page" );
	});
}

module( "amplify.store.memory", {
	setup: function() {
		for( var key in amplify.store.memory() ) {
			amplify.store.memory( key, null );
		}
	}
});

test( "memory", function() {
	expect( 9 );
	deepEqual( amplify.store.memory(), {}, "empty store" );
	equal( amplify.store.memory( "foo" ), undefined, "get; miss" );
	equal( amplify.store.memory( "foo", "bar" ), "bar", "set" );
	equal( amplify.store.memory( "foo" ), "bar", "get" );
	deepEqual( amplify.store.memory( "baz", { qux: "quux" } ),
		{ qux: "quux" }, "set object" );
	deepEqual( amplify.store.memory( "baz" ), { qux: "quux" }, "get object" );
	deepEqual( amplify.store.memory(),
		{ foo: "bar", baz: { qux: "quux" } }, "get all" );
	equal( amplify.store.memory( "foo", null ), null, "delete" );
	equal( amplify.store.memory( "foo" ), undefined, "deleted" );
});

asyncTest( "memory expiration", function() {
	expect( 5 );
	amplify.store.memory( "forever", "not really", { expires: 100 } );
	amplify.store.memory( "forever", "and ever" );
	amplify.store.memory( "expiring1", "i disappear",
		{ expires: 500 } );
	amplify.store.memory( "expiring2", "i disappear too",
		{ expires: 1000 } );
	deepEqual( amplify.store.memory(), {
		forever: "and ever",
		expiring1: "i disappear",
		expiring2: "i disappear too"
	}, "all values exist" );
	setTimeout(function() {
		deepEqual( amplify.store.memory(), {
			forever: "and ever",
			expiring2: "i disappear too"
		}, "500 expired, others exist" );
		equal( amplify.store.memory( "expiring1" ), undefined,
			"500 expired" );
		equal( amplify.store.memory( "expiring2" ), "i disappear too",
		"1000 still valid" );
	}, 750 );
	setTimeout(function() {
		deepEqual( amplify.store.memory(), { forever: "and ever" }, "both expired" );
		start();
	}, 1250 );
});
