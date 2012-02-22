# amplify core

The AmplifyJS core library provides two methods (`amplify.publish` and `amplify.subscribe`). AmplifyJS provides methods to facilitate the Publish and Subscribe messaging pattern in your front-end application. The idea is that someone is broadcasting one or more messages (publishing) and someone else is listening to one or more messages (subscribing). By separating your logic out like this it allows for loose coupling of your components, which results in less brittle and more reusable code.

It is possible to implement the publish and subscribe model by using jQuery custom events, however, the AmplifyJS pub/sub component provides a slightly cleaner interface, prevents collisions between custom events and method names, and allows a priority to your messages.

## Usage

	amplify.subscribe( string topic, function callback )
	amplify.subscribe( string topic, object context, function callback )
	amplify.subscribe( string topic, function callback, number priority )
	amplify.subscribe(
		string topic, object context, function callback, number priority )

Subscribe to a message.

* `topic`: Name of the message to subscribe to. Can be either a single topic (e.g. - "bacon") or a space-delimited list of topics (e.g. - "bacon sizzle foo bar").  Providing a space-delimited list of topics will create separate subscriptions for each topic, using the same callback.
* [`context`]: What `this` will be when the callback is invoked.
* `callback`: Function to invoke when the message is published.
* [`priority`]: Priority relative to other subscriptions for the same message. Lower values have higher priority. Default is 10.

> Returning `false` from a subscription will prevent any additional subscriptions from being invoked and will cause `amplify.publish` to return `false`.

<pre><code>amplify.unsubscribe( string topic, function callback )</code></pre>

Remove a subscription.

* `topic`: The topic being unsubscribed from.
* `callback`: The callback that was originally subscribed.

<pre><code>amplify.publish( string topic, ... )</code></pre>

Publish a message.

* `topic`: The name of the message to publish.
* Any additional parameters will be passed to the subscriptions.

> `amplify.publish` returns a boolean indicating whether any subscriptions returned `false`.
> The return value is `true` if none of the subscriptions returned `false`, and `false` otherwise. Note that only one subscription can return `false` because doing so will prevent additional subscriptions from being invoked.

## Examples

### Subscribe and publish with no data

Subscribing to a topic with no data allows a generic message to be
published on the bus for any event (user or code related) that needs communicated but no data
is needed along with the event.

	amplify.subscribe( "nodataexample", function() {
		alert( "nodataexample topic published!" );
	});
	
	//...
	
	amplify.publish( "nodataexample" );

### Subscribe and publish with data

The majority usage of a pub/sub system includes passing data from the
publisher to any subscriptions listening to the topic.

	amplify.subscribe( "dataexample", function( data ) {
		alert( data.foo ); // bar
	});
	
	//...
	
	amplify.publish( "dataexample", { foo: "bar" } );

You can choose to pass multiple parameters to any subscriber as well.

	amplify.subscribe( "dataexample2", function( param1, param2 ) {
		alert( param1 + param2 ); // barbaz
	});
	
	//...
	
	amplify.publish( "dataexample2", "bar", "baz" );

### Subscribe and publish with context and data

Often there is a need to operate within a context for a subscription
callback. It can be a reasonable strategy to have the context be set to
a jQuery object that will be used inside of the subscription, or even a
native DOM element.

> Note: the following example assumes jQuery is already loaded on the
> page, and assumes at least one paragraph exists within the body of the page.

	amplify.subscribe( "datacontextexample", $( "p:first" ), function( data ) {
		this.text( data.exampleText ); // first p element would have "foo bar baz" as text
	});
	
	//...
	
	amplify.publish( "datacontextexample", { exampleText: "foo bar baz" } );

### Subscribe to a topic with high priority

Subscribing to a topic with high priority can be useful as an error
handler or anytime data may need to be checked or augmented before
proceeding.

	amplify.subscribe( "priorityexample", function( data ) {
		alert( data.foo );
	});

	amplify.subscribe( "priorityexample", function( data ) {
		if ( data.foo === "oops" ) {
			return false;
		}
	}, 1 );
	
	//...
	
	amplify.publish( "priorityexample", { foo: "bar" } );
	amplify.publish( "priorityexample", { foo: "oops" } );

### Subscribing to multiple topics

Subscribe to "foo", "bar" and "baz", using the same callback.

    amplify.subscribe( "foo bar baz", function( data ) {
        console.log( "data: " + data );
    } );

Amplify does not pass the topic into the subscription callback's parameters.  If you need the topic to be passed to the subscription callback, you can wrap the `amplify.subscribe` call with a proxy function:

    var slice = [].slice,
        wrapper = function( topic, context, callback, priority ) {
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
            var fn = function() {
                return callback.apply( this, [ topic ].concat( slice.call( arguments,0 ) ) );
            };
            return amplify.subscribe( topic, context, fn, priority );
        },
        subscribe = function() {
            var index = 0,
                args = slice.call( arguments, 0 ),
                topics = args[ 0 ].split( /\s/ ),
                length = topics.length,
                res = {};
            for ( ; index < length; index++ ) {
                res[ topics[ index ] ] = wrapper.apply( this, [ topics[ index ] ].concat( slice.call( args, 1 ) ) );
            }
            // returns a topic/subscription hash in order to support 1-n topics
            return res;
        };

    var fn = function( topic, data ) {
            console.log( "The " + topic + " says '" + data.bar + "'." );
        },
        callbacks = subscribe( "lion kitty dog", fn );

    amplify.publish( "lion", { bar: "RAWR!" } );         // The lion says 'RAWR!'.
    amplify.publish( "kitty", { bar: "meow" } );         // The kitty says 'meow'.
    amplify.publish( "dog", { bar: "Woof!" } );          // The dog says 'Woof!'.

    amplify.unsubscribe( "lion", callbacks["lion"] );

    amplify.publish( "lion", { bar: "RAWR!" } );         // Nothing happens - we unsubscribed above
    amplify.publish( "kitty", { bar: "meow" } );         // The kitty says 'meow'.
    amplify.publish( "dog", { bar: "Woof!" } );          // The dog says 'Woof!'.

