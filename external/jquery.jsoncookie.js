/*!
 * jQuery JSON Cookie
 * 
 * Version: @VERSION
 * Released: @DATE
 * Source: http://github.com/appendto/jquery-jsoncookie
 * 
 * Copyright 2011 appendTo LLC. (http://appendto.com/team)
 * Dual licensed under the MIT or GPL licenses.
 * http://appendto.com/open-source-licenses
 */
(function( $ ) {

var encode = encodeURIComponent,
	decode = decodeURIComponent;

function now() {
	return (new Date()).getTime();
}

$.cookie = function( key, value, options ) {
	options = $.extend( {}, options );
	var expires = options.expires,
		result = value;

	// get all cookies
	if ( !key ) {
		result = {};
		$.each( document.cookie.split( "; " ), function( i, cookie ) {
			if ( !cookie ) {
				return;
			}
			var parts = cookie.split( "=" );
			result[ decode( parts[ 0 ] ) ] = JSON.parse( decode( parts[ 1 ] ) );
		});
		return result;
	}

	// get/set a specific cookie
	key = encode( key );
	if ( value === undefined ) {
		result = new RegExp( "(?:^|; )" + key + "=([^;]*)" ).exec( document.cookie );
		return result && JSON.parse( decode( result[ 1 ] ) );
	} else {
		if ( value === null ) {
			expires = -1;
		}
		if ( typeof expires === "number" ) {
			expires = new Date( now() + expires );
		}

		document.cookie = [
			key, "=", encode( JSON.stringify( value ) ),
			expires ? "; expires=" + expires.toUTCString() : "",
			options.path ? "; path=" + options.path : "",
			options.domain ? "; domain=" + options.domain : "",
			options.secure ? "; secure" : ""
		].join( "" );
	}

	return result;
};

// support test
(function() {
	var test = "jsoncookie" + now();
	$.cookie( test, test );
	$.support.cookie = $.cookie( test ) === test;
	$.cookie( test, null );
}() );

}( jQuery ) );
