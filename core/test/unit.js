module( "amplify.core pubsub" );

test( "continuation", function() {
	expect( 7 );
	amplify.subscribe( "continuation", function() {
		ok( true, "first subscriber called" );
	});
	amplify.subscribe( "continuation", function() {
		ok( true, "continued after no return value" );
		return true;
	});
	strictEqual( amplify.publish( "continuation" ), true,
		"return true when subscriptions are not stopped" );

	amplify.subscribe( "continuation", function() {
		ok( true, "continued after returning true" );
		return false;
	});
	amplify.subscribe( "continuation", function() {
		ok( false, "continued after returning false" );
	});
	strictEqual( amplify.publish( "continuation" ), false,
		"return false when subscriptions are stopped" );
});

test( "priority", function() {
	expect( 5 );
	var order = 0;

	amplify.subscribe( "priority", function() {
		strictEqual( order, 1, "priority default; #1" );
		order++;
	});
	amplify.subscribe( "priority", function() {
		strictEqual( order, 3, "priority 15; #1" );
		order++;
	}, 15 );
	amplify.subscribe( "priority", function() {
		strictEqual( order, 2, "priority default; #2" );
		order++;
	});
	amplify.subscribe( "priority", function() {
		strictEqual( order, 0, "priority 1; #1" );
		order++;
	}, 1 );
	amplify.subscribe( "priority", {}, function() {
		strictEqual( order, 4, "priority 15; #2" );
		order++;
	}, 15 );
	amplify.publish( "priority" );
});

test( "context", function() {
	expect( 3 );
	var obj = {},
		fn = function() {};

	amplify.subscribe( "context", function() {
		strictEqual( this, window, "default context" );
	});
	amplify.subscribe( "context", obj, function() {
		strictEqual( this, obj, "object" );
	});
	amplify.subscribe( "context", fn, function() {
		strictEqual( this, fn, "function" );
	});
	amplify.publish( "context" );
});

test( "data", function() {
	amplify.subscribe( "data", function( string, number, object ) {
		strictEqual( string, "hello", "string passed" );
		strictEqual( number, 5, "number passed" );
		deepEqual( object, {
			foo: "bar",
			baz: "qux"
		}, "object passed" );
		string = "goodbye";
		object.baz = "quux";
	});
	amplify.subscribe( "data", function( string, number, object ) {
		strictEqual( string, "hello", "string unchanged" );
		strictEqual( number, 5, "number unchanged" );
		deepEqual( object, {
			foo: "bar",
			baz: "quux"
		}, "object changed" );
	});

	var obj = {
		foo: "bar",
		baz: "qux"
	};
	amplify.publish( "data", "hello", 5, obj );
	deepEqual( obj, {
		foo: "bar",
		baz: "quux"
	}, "object updated" );
});

test( "unsubscribe", function() {
	expect( 4 );
	var order = 0;

	amplify.subscribe( "unsubscribe", function() {
		strictEqual( order, 0, "first subscriber called" );
		order++;
	});
	var fn = function() {
		ok( false, "removed by original reference" );
		order++;
	};
	amplify.subscribe( "unsubscribe", fn );
	amplify.subscribe( "unsubscribe", function() {
		strictEqual( order, 1, "second subscriber called" );
		order++;
	});
	var fn2 = amplify.subscribe( "unsubscribe", function() {
		ok( false, "removed by returned reference" );
		order++;
	});
	amplify.unsubscribe( "unsubscribe", fn );
	amplify.unsubscribe( "unsubscribe", fn2 );
	try {
		amplify.unsubscribe( "unsubscribe", function() {});
		ok( true, "no error with invalid handler" );
	} catch ( e ) {
		ok( false, "error with invalid handler" );
	}
	try {
		amplify.unsubscribe( "unsubscribe2", function() {});
		ok( true, "no error with invalid topic" );
	} catch ( e ) {
		ok( false, "error with invalid topic" );
	}
	amplify.publish( "unsubscribe" );
});

test( "unsubscribe during publish", function() {
	expect( 3 );

	function racer() {
		ok( true, "second" );
		amplify.unsubscribe( "racy", racer );
	}

	amplify.subscribe( "racy", function() {
		ok( true, "first" );
	});
	amplify.subscribe( "racy", racer );
	amplify.subscribe( "racy", function() {
		ok( true, "third" );
	});
	amplify.publish( "racy" );
});

test( "multiple subscriptions", function() {
	expect( 4 );

	amplify.subscribe( "sub-a-1 sub-a-2 sub-a-3", function() {
		ok( true );
	});
	amplify.publish( "sub-a-1" );

	amplify.subscribe( "sub-b-1 sub-b-2", function() {
		ok( true );
	});
	
	// Test for Ticket #18
	amplify.subscribe( "sub-b-1 sub-b-3", function() {
		ok( true );
	});
	
	amplify.publish( "sub-b-2" );
	amplify.publish( "sub-b-2" );
	amplify.publish( "sub-b-3" );
});
