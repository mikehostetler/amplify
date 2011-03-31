/*!
 * Amplify Request @VERSION
 * 
 * Copyright 2011 appendTo LLC. (http://appendto.com/team)
 * Dual licensed under the MIT or GPL licenses.
 * http://appendto.com/open-source-licenses
 * 
 * http://amplifyjs.com
 */
(function( amplify, undefined ) {

function noop() {}
function isFunction( obj ) {
	return ({}).toString.call( obj ) === "[object Function]";
}

amplify.request = function( resourceId, data, callback ) {
	// default to an empty hash just so we can handle a missing resourceId
	// in one place
	var settings = resourceId || {};

	if ( typeof settings === "string" ) {
		if ( isFunction( data ) ) {
			callback = data;
			data = {};
		}
		settings = {
			resourceId: resourceId,
			data: data || {},
			success: callback
		};
	}

	var request = { abort: noop },
		resource = amplify.request.resources[ settings.resourceId ],
		success = settings.success || noop,
		error = settings.error || noop;
	settings.success = function( data, extra, status ) {
		amplify.publish( "request.success", settings, data, extra, status );
		amplify.publish( "request.complete", settings, data, extra, status );
		success.apply( this, arguments );
	};
	settings.error = function( data, extra, status ) {
		amplify.publish( "request.error", settings, data, extra, status );
		amplify.publish( "request.complete", settings, data, extra, status );
		error.apply( this, arguments );
	};

	if ( !resource ) {
		if ( !settings.resourceId ) {
			throw "amplify.request: no resourceId provided";
		}
		throw "amplify.request: unknown resourceId: " + settings.resourceId;
	}

	if ( amplify.publish( "request.before", settings ) ) {
		amplify.request.resources[ settings.resourceId ]( settings, request );
	}

	return request;
};

amplify.request.types = {};
amplify.request.resources = {};
amplify.request.define = function( resourceId, type, settings ) {
	if ( typeof type === "string" ) {
		if ( !( type in amplify.request.types ) ) {
			throw "amplify.request.define: unknown type: " + type;
		}

		settings.resourceId = resourceId;
		amplify.request.resources[ resourceId ] =
			amplify.request.types[ type ]( settings );
	} else {
		// no pre-processor or settings for one-off types (don't invoke)
		amplify.request.resources[ resourceId ] = type;
	}
};

}( amplify ) );





(function( amplify, $, undefined ) {

amplify.request.types.ajax = function( defnSettings ) {
	defnSettings = $.extend({
		type: "GET"
	}, defnSettings );

	return function( settings, request ) {
		var url = defnSettings.url,
			data = settings.data,
			abort = request.abort,
			ajaxSettings,
			regex,
			xhr;

		if ( typeof data !== "string" ) {
			data = $.extend( true, {}, defnSettings.data, data );
			$.each( data, function( key, value ) {
				regex = new RegExp( "{" + key + "}", "g");
				if ( regex.test( url ) ) {
					url = url.replace( regex, value );
					delete data[ key ];
				}
			});
		}

		xhr = $.ajax( $.extend( {}, defnSettings, {
			url: url,
			type: defnSettings.type,
			data: data,
			dataType: defnSettings.dataType,
			success: function( data, status, xhr ) {
				settings.success( data, xhr, status );
			},
			// data parameter is for custom overrides that proxy this function
			error: function( xhr, status, error, data ) {
				if ( data === undefined ) {
					// TODO: add support for ajax errors with data
					data = null;
				}
				settings.error( data, xhr, status );
			},
			beforeSend: function( xhr, ajaxSettings ) {
				var ret = defnSettings.beforeSend ?
					defnSettings.beforeSend.apply( this, arguments ) : true,
					success,
					error;
				ret = ret && amplify.publish( "request.before.ajax",
					defnSettings, settings, ajaxSettings, xhr );

				// wrap the callbacks to handle aborted requests in jQuery <1.5
				success = ajaxSettings.success;
				error = ajaxSettings.error;
				ajaxSettings.success = function( data, status, xhr ) {
					success( data, status, xhr );
				};
				ajaxSettings.error = function( xhr, status, _error, data ) {
					if ( this.aborted || !xhr.readyState ) {
						status = "abort";
					}
					error( xhr, status, error, data );
				};

				return ret;
			}
		}) );

		request.abort = function() {
			xhr.abort();
			abort.call( this );
		};
		try {
			var xhrAbort = xhr.abort;
			xhr.abort = function() {
				aborted = true;
				xhrAbort.call( this );
			};
		// proxying xhr.abort throws an error even when it works
		} catch ( e ) {}
	};
};



var cache = amplify.request.cache = {
	_key: function( resourceId, data ) {
		var length = data.length,
			i = 0,
			checksum = chunk();

		while ( i < length ) {
			checksum ^= chunk();
		}

		function chunk() {
			return data.charCodeAt( i++ ) << 24 |
				data.charCodeAt( i++ ) << 16 |
				data.charCodeAt( i++ ) << 8 |
				data.charCodeAt( i++ ) << 0;
		}

		return "request-" + resourceId + "-" + checksum;
	},

	_default: (function() {
		var memoryStore = {};
		return function( resource, settings, ajaxSettings ) {
			// data is already converted to a string by the time we get here
			var cacheKey = cache._key( resource.resourceId, ajaxSettings.data ),
				duration = resource.cache;

			if ( cacheKey in memoryStore ) {
				ajaxSettings.success( memoryStore[ cacheKey ] );
				return false;
			}
			var success = ajaxSettings.success;
			ajaxSettings.success = function( data ) {
				memoryStore[ cacheKey ] = data;
				if ( typeof duration === "number" ) {
					setTimeout(function() {
						delete memoryStore[ cacheKey ];
					}, duration );
				}
				success.apply( this, arguments );
			};
		};
	}())
};

if ( amplify.store ) {
	$.each( amplify.store.types, function( type ) {
		cache[ type ] = function( resource, settings, ajaxSettings ) {
			var cacheKey = cache._key( resource.resourceId, ajaxSettings.data ),
				cached = amplify.store[ type ]( cacheKey );

			if ( cached ) {
				ajaxSettings.success( cached );
				return false;
			}
			var success = ajaxSettings.success;
			ajaxSettings.success = function( data ) {	
				amplify.store[ type ]( cacheKey, data, { expires: resource.cache.expires } );
				success.apply( this, arguments );
			};
		};
	});
	cache.persist = cache[ amplify.store.type ];
}

amplify.subscribe( "request.before.ajax", function( resource ) {
	var cacheType = resource.cache;
	if ( cacheType ) {
		// normalize between objects and strings/booleans/numbers
		cacheType = cacheType.type || cacheType;
		return cache[ cacheType in cache ? cacheType : "_default" ]
			.apply( this, arguments );
	}
});



amplify.request.decoders = {
	// http://labs.omniti.com/labs/jsend
	jsend: function( data, status, xhr, success, error ) {
		if ( data.status === "success" ) {
			success( data.data );
		} else if ( data.status === "fail" ) {
			error( data.data, "fail" );
		} else if ( data.status === "error" ) {
			delete data.status;
			error( data, "error" );
		}
	}
};

amplify.subscribe( "request.before.ajax", function( resource, settings, ajaxSettings ) {
	var _success = ajaxSettings.success,
		_error = ajaxSettings.error,
		decoder = $.isFunction( resource.decoder )
			? resource.decoder
			: resource.decoder in amplify.request.decoders
				? amplify.request.decoders[ resource.decoder ]
				: amplify.request.decoders._default;

	if ( !decoder ) {
		return;
	}

	function success( xhr ) {
		return function( data, status ) {
			_success( data, status || "success", xhr );
		};
	}
	function error( xhr, _status ) {
		return function( data, status ) {
			_error( xhr, status || _status, null, data );
		};
	}
	ajaxSettings.success = function( data, status, xhr ) {
		decoder( data, status, xhr, success( xhr ), error( xhr, "error" ) );
	};
	ajaxSettings.error = function( xhr, status ) {
		decoder( null, status, xhr, success( xhr ), error( xhr, status ) );
	};
});

}( amplify, jQuery ) );
