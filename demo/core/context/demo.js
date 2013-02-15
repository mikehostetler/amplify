$( function() {

	// set up subscription with context specified
	// for the callback function
	amplify.subscribe( "datacontextexample",
		$( "p:first" ),
			function( data ) {
				this.text( data.exampleText );
		}
	);

	amplify.publish( "datacontextexample", { exampleText: "foo bar baz" } );

});
