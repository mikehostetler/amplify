$( function() {

	// check for the cookie plugin and cookies enabled
	if( !$.cookie || !$.support.cookie ) {
		$( "p" ).append( "cookie plugin not found or cookies disabled" );
		return;
	}

	// cookie storage is done only by explicitly specifying
	// storage through amplify.store.cookie.
	// cookie will also serialize to/from JSON, allowing
	// for easy client and server-side deserialization
	// currently you are responsible for ensuring that your
	// data is not over the cookie size limit. Use at your
	// own risk!
	amplify.store.cookie( "cookieExample", { foo3: "qux" } );

	// retrieve the data later via the key
	var myCookieValue = amplify.store.cookie( "cookieExample" );

	$( "p" )
		.append( myCookieValue.foo3 ); // qux

});
