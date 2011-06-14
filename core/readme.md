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

* `topic`: Name of the message to subscribe to.
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