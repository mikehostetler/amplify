(function() {

var parts = document.location.search.slice( 1 ).split( "&" ),
	length = parts.length,
	i = 0,
	current,
	version = "1.4.4";

for ( ; i < length; i++ ) {
	current = parts[ i ].split( "=" );
	if ( current[ 0 ] === "jquery" ) {
		version = current[ 1 ];
		break;
	}
}

document.write( "<script src='../../external/jquery-" + version + ".js'></script>" );

}() );