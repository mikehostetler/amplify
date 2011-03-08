/*!
 * Amplify Store - Persistent Client-Side Storage @VERSION
 * 
 * Copyright 2011 appendTo LLC. (http://appendto.com/team)
 * Dual licensed under the MIT or GPL licenses.
 * http://appendto.com/open-source-licenses
 * 
 * http://amplifyjs.com
 */
(function( amplify, undefined ) {

var store = amplify.store = function( key, value, options, type ) {
	var type = store.type;
	if ( options && options.type && options.type in store.types ) {
		type = options.type;
	}
	return store.types[ type ]( key, value, options || {} );
};

store.types = {};
store.type = null;
store.addType = function( type, storage ) {
	if ( !store.type ) {
		store.type = type;
	}

	store.types[ type ] = storage;
	store[ type ] = function( key, value, options ) {
		options = options || {};
		options.type = type;
		return store( key, value, options );
	};
}

function createSimpleStorage( storageType, storage ) {
	var values = storage.__amplify__ ? JSON.parse( storage.__amplify__ ) : {};
	store.addType( storageType, function( key, value, options ) {
		var ret = value,
			now = (new Date()).getTime(),
			storedValue,
			parsed;

		if ( !key ) {
			ret = {};
			for ( key in values ) {
				storedValue = storage[ key ];
				parsed = storedValue ? JSON.parse( storedValue ) : { expires: -1 };
				if ( parsed.expires && parsed.expires <= now ) {
					delete storage[ key ];
					delete values[ key ];
				} else {
					ret[ key.replace( /^__amplify__/, "" ) ] = parsed.data;
				}
			}
			storage.__amplify__ = JSON.stringify( values );
			return ret;
		}

		// protect against overwriting built-in properties
		key = "__amplify__" + key;

		if ( value === undefined ) {
			if ( values[ key ] ) {
				storedValue = storage[ key ];
				parsed = storedValue ? JSON.parse( storedValue ) : { expires: -1 };
				if ( parsed.expires && parsed.expires <= now ) {
					delete storage[ key ];
					delete values[ key ];
				} else {
					return parsed.data;
				}
			}
		} else {
			if ( value === null ) {
				delete storage[ key ];
				delete values[ key ];
			} else {
				storage[ key ] = JSON.stringify({
					data: value,
					expires: options.expires ? now + options.expires : null
				});
				values[ key ] = true;
			}
		}

		storage.__amplify__ = JSON.stringify( values );
		return ret;
	});
}

// localStorage + sessionStorage
// IE 8+, Firefox 3.5+, Safari 4+, Chrome 4+, Opera 10.5+, iPhone 2+, Android 2+
for ( var webStorageType in { localStorage: 1, sessionStorage: 1 } ) {
	// try/catch for file protocol in Firefox
	try {
		if ( window[ webStorageType ].getItem ) {
			createSimpleStorage( webStorageType, window[ webStorageType ] );
		}
	} catch( e ) {}
}

// globalStorage
// non-standard: Firefox 2+
// https://developer.mozilla.org/en/dom/storage#globalStorage
if ( window.globalStorage ) {
	createSimpleStorage( "globalStorage",
		window.globalStorage[ window.location.hostname ] );
}

// userData
// non-standard: IE 5+
// http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
(function() {
	// append to html instead of body so we can do this from the head
	var div = document.createElement( "div" ),
		attrKey = "amplify",
		attrs;
	div.style.display = "none";
	document.documentElement.appendChild( div );
	if ( div.addBehavior ) {
		div.addBehavior( "#default#userdata" );
		div.load( attrKey );
		attrs = div.getAttribute( attrKey ) ? JSON.parse( div.getAttribute( attrKey ) ) : {};

		store.addType( "userData", function( key, value, options ) {
			var ret = value,
				now = (new Date()).getTime(),
				attr,
				parsed;

			if ( !key ) {
				ret = {};
				for ( key in attrs ) {
					attr = div.getAttribute( key );
					parsed = attr ? JSON.parse( attr ) : { expires: -1 };
					if ( parsed.expires && parsed.expires <= now ) {
						div.removeAttribute( key );
						delete attrs[ key ];
					} else {
						ret[ key ] = parsed.data;
					}
				}
				div.setAttribute( attrKey, JSON.stringify( attrs ) );
				div.save( attrKey );
				return ret;
			}

			// convert invalid characters to dashes
			// http://www.w3.org/TR/REC-xml/#NT-Name
			// simplified to assume the starting character is valid
			// also removed colon as it is invalid in HTML attribute names
			key = key.replace( /[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-" );

			if ( value === undefined ) {
				if ( key in attrs ) {
					attr = div.getAttribute( key );
					parsed = attr ? JSON.parse( attr ) : { expires: -1 };
					if ( parsed.expires && parsed.expires <= now ) {
						div.removeAttribute( key );
						delete attrs[ key ];
					} else {
						return parsed.data;
					}
				}
			} else {
				if ( value === null ) {
					div.removeAttribute( key );
					delete attrs[ key ];
				} else {
					div.setAttribute( key, JSON.stringify({
						data: value,
						expires: (options.expires ? (now + options.expires) : null)
					}) );
					attrs[ key ] = true;
				}
			}

			div.setAttribute( attrKey, JSON.stringify( attrs ) );
			div.save( attrKey );
			return ret;
		});
	}
}() );

// in-memory storage
// fallback for all browsers to enable the API even if we can't persist data
createSimpleStorage( "memory", {} );

// cookie
// supported to enable a common API
// never registers as the default for performance reasons
(function( $ ) {
	if ( $ && $.cookie && $.support.cookie ) {
		store.addType( "cookie", function( key, value, options ) {
			return $.cookie( key, value, {
				expires: options.expires || 99e9,
				path: "/"
			});
		});
	}
}( jQuery ) );

}( this.amplify = this.amplify || {} ) );
