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
store.error = function() {
	return "amplify.store quota exceeded"; 
};

var rprefix = /^__amplify__/;
function createFromStorageInterface( storageType, storage ) {
	store.addType( storageType, function( key, value, options ) {
		var storedValue, parsed, i,
			ret = value,
			now = (new Date()).getTime();

		if ( !key ) {
			ret = {};
			i = 0;
			try {
				while ( key = storage.key( i++ ) ) {
					if ( rprefix.test( key ) ) {
						parsed = JSON.parse( storage.getItem( key ) );
						if ( parsed.expires && parsed.expires <= now ) {
							storage.removeItem( key );
						} else {
							ret[ key.replace( rprefix, "" ) ] = parsed.data;
						}
					}
				}
			} catch ( error ) {}
			return ret;
		}

		// protect against name collisions with direct storage
		key = "__amplify__" + key;

		if ( value === undefined ) {
			storedValue = storage.getItem( key );
			parsed = storedValue ? JSON.parse( storedValue ) : { expires: -1 };
			if ( parsed.expires && parsed.expires <= now ) {
				storage.removeItem( key );
			} else {
				return parsed.data;
			}
		} else {
			if ( value === null ) {
				storage.removeItem( key );
			} else {
				parsed = JSON.stringify({
					data: value,
					expires: options.expires ? now + options.expires : null
				});
				try {
					storage.setItem( key, parsed );
				// quota exceeded
				} catch( error ) {
					// expire old data and try again
					store[ storageType ]();
					try {
						storage.setItem( key, parsed );
					} catch( error ) {
						throw store.error();
					}
				}
			}
		}

		return ret;
	});
}

// localStorage + sessionStorage
// IE 8+, Firefox 3.5+, Safari 4+, Chrome 4+, Opera 10.5+, iPhone 2+, Android 2+
for ( var webStorageType in { localStorage: 1, sessionStorage: 1 } ) {
	// try/catch for file protocol in Firefox
	try {
		if ( window[ webStorageType ].getItem ) {
			createFromStorageInterface( webStorageType, window[ webStorageType ] );
		}
	} catch( e ) {}
}

// globalStorage
// non-standard: Firefox 2+
// https://developer.mozilla.org/en/dom/storage#globalStorage
if ( window.globalStorage ) {
	// try/catch for file protocol in Firefox
	try {
		createFromStorageInterface( "globalStorage",
			window.globalStorage[ window.location.hostname ] );
		// Firefox 2.0 and 3.0 have sessionStorage and globalStorage
		// make sure we default to globalStorage
		// but don't default to globalStorage in 3.5+ which also has localStorage
		if ( store.type === "sessionStorage" ) {
			store.type = "globalStorage";
		}
	} catch( e ) {}
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
	document.getElementsByTagName( "head" )[ 0 ].appendChild( div );
	if ( div.addBehavior ) {
		div.addBehavior( "#default#userdata" );
		div.load( attrKey );
		attrs = div.getAttribute( attrKey ) ? JSON.parse( div.getAttribute( attrKey ) ) : {};

		store.addType( "userData", function( key, value, options ) {
			var ret = value,
				now = (new Date()).getTime(),
				attr,
				parsed,
				prevValue;

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
					// we need to get the previous value in case we need to rollback
					prevValue = div.getAttribute( key );
					parsed = JSON.stringify({
						data: value,
						expires: (options.expires ? (now + options.expires) : null)
					});
					div.setAttribute( key, parsed );
					attrs[ key ] = true;
				}
			}

			div.setAttribute( attrKey, JSON.stringify( attrs ) );
			try {
				div.save( attrKey );
			// quota exceeded
			} catch ( error ) {
				// roll the value back to the previous value
				if ( prevValue === null ) {
					div.removeAttribute( key );
					delete attrs[ key ];
				} else {
					div.setAttribute( key, prevValue );
				}

				// expire old data and try again
				store.userData();
				try {
					div.setAttribute( key, parsed );
					attrs[ key ] = true;
					div.save( attrKey );
				} catch ( error ) {
					// roll the value back to the previous value
					if ( prevValue === null ) {
						div.removeAttribute( key );
						delete attrs[ key ];
					} else {
						div.setAttribute( key, prevValue );
					}
					throw store.error();
				}
			}
			return ret;
		});
	}
}() );

// in-memory storage
// fallback for all browsers to enable the API even if we can't persist data
(function() {
	var memory = {};

	function copy( obj ) {
		return obj === undefined ? undefined : JSON.parse( JSON.stringify( obj ) );
	}

	store.addType( "memory", function( key, value, options ) {
		if ( !key ) {
			return copy( memory );
		}

		if ( value === undefined ) {
			return copy( memory[ key ] );
		}

		if ( value === null ) {
			delete memory[ key ];
			return null;
		}

		memory[ key ] = value;
		if ( options.expires ) {
			setTimeout(function() {
				delete memory[ key ];
			}, options.expires );
		}

		return value;
	});
}() );

}( this.amplify = this.amplify || {} ) );
