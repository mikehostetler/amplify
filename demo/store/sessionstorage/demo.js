$( function() {
	// since we are using a specific tech
	// we are responsible for checking.
	if ( !amplify.store.types.sessionStorage ) {
		$( "p" )
			.append( "sessionStorage not available in this browser." );
		return;
	}

	// you can store any type of data using store
	// amplify will take care of serializing/deserializing
	// the data for you.
	amplify.store.sessionStorage( "explicitExample",
		{ foo2: "baz" } );

	// retrieve the data later via the key
	var myStoredValue2 =
		amplify.store.sessionStorage( "explicitExample" );

	$( "p" )
		.append( myStoredValue2.foo2 ); // baz
});
