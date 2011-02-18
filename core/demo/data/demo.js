$( function() {

	// data can be expected as an object literal / hash
	amplify.subscribe( "dataexample", function( data ) {
		$( "p" ).append( data.foo ); // bar
	});

	// or individual parameters.
	amplify.subscribe( "dataexample2", function( param1, param2 ) {
		$( "p" ).append( param1 + param2 ); // barbaz
	});

	amplify.publish( "dataexample", { foo: "bar" } );
	amplify.publish( "dataexample2", "bar", "baz" );
});
