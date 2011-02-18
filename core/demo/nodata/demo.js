$( function() {

	amplify.subscribe( "nodataexample", function() {
		$( "p").append( "first subscription called\n" );
	});

	// there can be more than one subscriber for a topic
	amplify.subscribe( "nodataexample", function() {
		$( "p").append( "second subscription called\n" );
	});

	// the subscriptions are triggered through a publish
	// call on the topic
	amplify.publish( "nodataexample" );
});
