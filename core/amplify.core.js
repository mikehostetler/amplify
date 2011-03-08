/*!
 * Amplify @VERSION
 * 
 * Copyright 2011 appendTo LLC. (http://appendto.com/team)
 * Dual licensed under the MIT or GPL licenses.
 * http://appendto.com/open-source-licenses
 * 
 * http://amplifyjs.com
 */
(function( undefined ) {

var slice = [].slice,
	subscriptions = {};

var amplify = this.amplify = {
	each: function( arr, fn ) {
		for ( var i = 0, length = arr.length; i < length; i++ ) {
			if ( false === fn( arr[ i ], i, arr ) ) {
				return;
			}
		}
	},
	extend: function( a, b ) {
		for ( var prop in b ) {
			a[ prop ] = b[ prop ];
		}
		return a;
	}
};

amplify.extend( amplify, {
	publish: function( topic ) {
		var args = slice.call( arguments, 1 ),
			ret;

		if ( !subscriptions[ topic ] ) {
			return true;
		}

		amplify.each( subscriptions[ topic ], function( subscription ) {
			return ( ret = subscription.callback.apply( subscription.context, args ) );
		});
		return ret !== false;
	},

	subscribe: function( topic, context, callback, priority ) {
		if ( arguments.length === 3 && typeof callback === "number" ) {
			priority = callback;
			callback = context;
			context = null;
		}
		if ( arguments.length === 2 ) {
			callback = context;
			context = null;
		}
		priority = priority || 10;

		if ( !subscriptions[ topic ] ) {
			subscriptions[ topic ] = [];
		}

		var i = subscriptions[ topic ].length - 1,
			subscriptionInfo = {
				callback: callback,
				context: context,
				priority: priority
			};

		for ( ; i >= 0; i-- ) {
			if ( subscriptions[ topic ][ i ].priority <= priority ) {
				subscriptions[ topic ].splice( i + 1, 0, subscriptionInfo );
				return callback;
			}
		}

		subscriptions[ topic ].unshift( subscriptionInfo );
		return callback;
	},

	unsubscribe: function( topic, callback ) {
		if ( !subscriptions[ topic ] ) {
			return;
		}

		amplify.each( subscriptions[ topic ], function( subscription, i ) {
			if ( subscription.callback === callback ) {
				subscriptions[ topic ].splice( i, 1 );
				return false;
			}
		});
	}
});

}() );
