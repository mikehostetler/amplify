$( function() {

	// with amplify you pick a resource id. and then
	// store an object
	amplify.store( "storeExample1", { foo: "bar" } );

	// or any type of data you'd like
	amplify.store( "storeExample2", "baz" );

	// retrieve the data later via the key
	var myStoredValue = amplify.store( "storeExample1" ),
	myStoredValue2 = amplify.store( "storeExample2" ),
	// you can dump all the stored value into a single hash
	myStoredValues = amplify.store();

	// amplify will take care of serializing/deserializing
	// the data, as well as choosing the best persistance
	// technology available on the client browser.
	$( "p" )
	    .append( myStoredValue.foo ) // bar
	    .append( myStoredValue2 ) // baz
	    .append( myStoredValues.storeExample1.foo ) // bar
	    .append( myStoredValues.storeExample2 ); // baz
});
