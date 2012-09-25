$( function() {

	// we can subscribe to a topic with a priority
	amplify.subscribe( "priorityexample", function( data ) {
		$( "p" ).append( "second highest priority.\n" );
	}, 2 );

	// we can use the highest priority possibly
	// keep other subscriptions from firing.
	amplify.subscribe( "priorityexample", function( data ) {
		$( "p" ).append( "highest priority.\n" );
		if ( data.foo === "oops" ) {
			return false;
		}
	}, 1 );

	// the default priority is '10'.
	amplify.subscribe( "priorityexample", function( data ) {
		$( "p" ).append( "default priority.\n" );
	});
	
	amplify.publish( "priorityexample", { foo: "bar" } );
	amplify.publish( "priorityexample", { foo: "oops" } );

});
