(function() {
	var url = window.location.search;
	url = decodeURIComponent( url.slice( url.indexOf( "swarmURL=" ) + 9 ) );
	if ( !url || url.indexOf( "http" ) !== 0 ) {
		return;
	}

	document.write( "<script src='http://swarm.amplifyjs.com/js/inject.js?" + (new Date).getTime() + "'></script>" );
}() );
