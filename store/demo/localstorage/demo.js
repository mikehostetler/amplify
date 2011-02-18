$( function() {
	// since we are using a specific tech, we
	// are responsible for checking.
	// use the right tool for the job.
	if( !Modernizr.localstorage ) {
		$( "p" )
			.append( "local storage not available in this browser." );
		return;
	}

	// you can store any type of data using store
	// amplify will take care of serializing/deserializing
	// the data for you.
	amplify.store.localStorage( "explicitExample",
								{ foo2: "baz" } );

	// retrieve the data later via the key
	var myStoredValue2 =
		amplify.store.localStorage( "explicitExample" );

	$( "p" )
		.append( myStoredValue2.foo2 ); // baz
});
