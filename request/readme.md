# amplify.request

`amplify.request` is an abstraction layer that can be used for any kind of request for data.
`amplify.request` sets out to separate the data retrieval and caching mechanisms from data requestors.

Using the `amplify.request.define` function you can create and maintain
your entire server interface and caching policy in a single place,
reducing the impact of any server interface changes. Components that
need data can retrieve the data through `amplify.request` without
concern for data caching, server interface, resource location,
data types, wrappers, and all the other specificities of the
client/server interaction.

Requests made through `amplify.request` will always be resolved asynchronously,
even if the resource invokes the callbacks immediately.
This ensures that you will never having timing problems if the request definition is changed in the future.

Just getting started? Take a look at the [examples][examples] section
below for a few of the popular use cases with `amplify.request`.

**NOTE:** `amplify.request` depends on the use of jQuery 1.4 or higher when the `ajax` request type is used.

## Usage

	amplify.request( string resourceId [, hash data [, function callback ]] )

Request a resource.

* `resourceId`: Identifier string for the resource.
* `data`: A set of key/value pairs of data to be sent to the resource.
* `callback`: A function to invoke if the resource is retrieved successfully.

<pre><code>amplify.request( hash settings )</code></pre>

Request a resource.

* `settings`: A set of key/value pairs of settings for the request.
  * `resourceId`: Identifier string for the resource.
  * `data` (optional): Data associated with the request.
  * `success` (optional): Function to invoke on success.
  * `error` (optional): Function to invoke on error.

<pre><code>amplify.request.define(
	string resourceId, string requestType [, hash settings ] )</code></pre>

Define a resource.

* `resourceId`: Identifier string for the resource.
* `requestType`: The type of data retrieval method from the server.
See the [request types][requestTypes] sections for more information.
* `settings`: A set of key/value pairs that relate to the server
  communication technology. The following settings are available:
  * Any settings found in jQuery.ajax().
  * `cache`: See the [cache][cache] section for more details.
  * `decoder`: See the [decoder][decoder] section for more details.

<pre><code>amplify.request.define( string resourceId, function resource )</code></pre>

Define a custom request.

* `resourceId`: Identifier string for the resource.
* `resource`: Function to handle requests. Receives a hash with the following properties:
  * `resourceId`: Identifier string for the resource.
  * `data`: Data provided by the user.
  * `success`: Callback to invoke on success.
  * `error`: Callback to invoke on error.

## Request Types

### Built-in Types

`amplify.request` comes with a built-in `ajax` type.

**NOTE:** The `ajax` request type depends on the use of jQuery 1.4 or higher.

### Custom Types

You can choose to create additional types by adding to the `amplify.request.types` hash.
There is also an option to define custom one-off types for single requests.

## Data Handling

### Pre-defined Data

When defining an ajax request, you can provide data in the definition.
This data will be merged (via a deep extend) with any data provided with the request.
Data provided with the request will override data provided in the definition.

### Data Mapping

Data maps allow you to modify the data for an ajax request before the data is sent.
You can use a hash to map keys or you can use a function for complete flexibility.
 
### URL substitution/routing

You can define variables in the URL of an ajax request by wrapping the variable in curly braces, e.g., `"/user/{id}"`.
The variable will be replaced by the respective value from the data provided in the request.
Whenever a variable is replaced, the value is removed from the data (not submitted as GET/POST data).
If there are variables that are not replaced, they will remain in the URL.

### Decoders

Decoders allow you to parse an ajax response before calling the success or error callback.
This allows you to return data marked with a status and react accordingly.
This also allows you to manipulate the data any way you want before passing the data along to the callback.

#### Built-in Decoders

[JSend](http://labs.omniti.com/labs/jsend) is a built in decoder
provided with the library.

#### Custom decoders

You can define new decoders by adding to the `amplify.request.decoders` hash. 
A popular use case for decoders is when you have a JSON envelope that
must be unpacked with each response from the server.

You can also define custom one-off decoders for single requests, which
is specified as a function in the settings hash for
`amplify.request.define`.

	amplify.request.decoders.decoderName = 
	    function( hash data, string status, object xhr,
	              function success, function error )

Define a decoder. `decoderName` should be replaced with the decoder name
of your choosing.

* `data`: Data returned from the ajax request.
* `status`: Status of the ajax request. See the [handling status][handlingstatus] section below.
* `xhr`: A wrapped xhr object used to make the request.
* `success`: Callback to invoke on success.
* `error`: Callback to invoke on error.

## Cache

### In-memory Cache

There is a built-in memory cache. You can pass a boolean to enable caching of a request, e.g., `cache: true`.
You can also pass a number to specify that the response should be cached for a certain amount of time.
For example, `cache: 30` will cache the response for 30 milliseconds.

* `cache: boolean` Cache the data in memory for the remainder of this page load.
* `cache: number` Cache the data in memory for the specified number of milliseconds.

### Named Caches

* `cache: string` Cache the data using a pre-defined caching mechanism.

<pre><code>cache: {
	type: string,
	expires: number
}
</code></pre>

Cache the data using a pre-defined caching mechanism for the specified number
of milliseconds.

#### Persistent Client-side Cache

You can also persist a cache if `amplify.store` has been loaded.
You can specify `cache: "persist"` to cache in the default store
or you can specify any of the specific stores available, e.g., `cache: "localStorage"`.
You can also use the hash form listed above to store in a persistent cache with
an expiration.

_Note: You must include `amplify.store.js` before `amplify.request.js` to use persistent caches._

### Custom Cache

You can also create additional cache types by adding to the `amplify.request.cache` hash.

	amplify.request.cache.customCacheName = 
		function( hash resource, hash settings, hash ajaxSettings )

Definition for a caching mechanism. `customCacheName` should be replaced
with the custom name of your choosing.

* `resource`: The definition of the resource being requested.
* `settings`: The settings for the request.
* `ajaxSettings`: The settings that will be passed to `jQuery.ajax()`.

## Examples

The examples assume that the request location returns the following as
json unless specified otherwise:

	{
		"foo" : "bar",
		"baz" : "qux"
	}

### Set up and use a request utilizing Ajax

	amplify.request.define( "ajaxExample1", "ajax", {
		url: "/myApiUrl",
		dataType: "json",
		type: "GET"
	});

	// later in code
	amplify.request( "ajaxExample1", function( data ) {
		data.foo; // bar
	});

### Set up and use a request utilizing Ajax and Caching

	amplify.request.define( "ajaxExample2", "ajax", {
		url: "/myApiUrl",
		dataType: "json",
		type: "GET",
		cache: "persist"
	});

	// later in code
	amplify.request( "ajaxExample2", function( data ) {
		data.foo; // bar
	});

	// a second call will result in pulling from the cache
	amplify.request( "ajaxExample2", function( data ) {
		data.baz; // qux
	})

### Set up and use a RESTful request utilizing Ajax

	amplify.request.define( "ajaxRESTFulExample", "ajax", {
		url: "/myRestFulApi/{type}/{id}",
		type: "GET"
	})

	// later in code
	amplify.request( "ajaxRESTFulExample",
		{
			type: "foo",
			id: "bar"
		},
		function( data ) {
			// /myRESTFulApi/foo/bar was the URL used
			data.foo; // bar
		}
	);

### POST data with Ajax

	amplify.request.define( "ajaxPostExample", "ajax", {
		url: "/myRestFulApi",
		type: "POST"
	})

	// later in code
	amplify.request( "ajaxPostExample",
		{
			type: "foo",
			id: "bar"
		},
		function( data ) {
			data.foo; // bar
		}
	);

### Using data maps

When searching Twitter, the key for the search phrase is `q`.
If we want a more descriptive name, such as `term`, we can use a data map:

	amplify.request.define( "twitter-search", "ajax", {
		url: "http://search.twitter.com/search.json",
		dataType: "jsonp",
		dataMap: {
			term: "q"
		}
	});

	amplify.request( "twitter-search", { term: "amplifyjs" }, ... );

Similarly, we can create a request that searches for mentions, by accepting a username:

	amplify.request.define( "twitter-mentions", "ajax", {
		url: "http://search.twitter.com/search.json",
		dataType: "jsonp",
		dataMap: function( data ) {
			return {
				q: "@" + data.user
			};
		}
	});

	amplify.request( "twitter-mentions", { user: "amplifyjs" }, ... );

### Setting up and using decoders

This example assumes the following envelope format:

**Success:**

	{
		"status": "success",
		"data" : {
			"foo": "bar",
			"baz": "qux"
		}
	}

**Fail ( or Error ):**

	{
		"status": "fail",
		"message": "failure message."
	}

**Example:**

	amplify.request.decoders.appEnvelope =
		function ( data, status, xhr, success, error ) {
			if ( data.status === "success" ) {
				success( data.data );
			} else if ( data.status === "fail" || data.status === "error" ) {
				error( data.message, data.status );
			} else {
				error( data.message , "fatal" );
			}
		};

	amplify.request.define( "decoderExample", "ajax", {
		url: "/myAjaxUrl",
		type: "POST",
		decoder: "appEnvelope"
	});

	amplify.request({
		resourceId: "decoderExample",
		success: function( data ) {
			data.foo; // bar
		},
		error: function( message, level ) {
			alert( "always handle errors with alerts." );
		}
	});

### POST with caching and single-use decoder

This example assumes the following envelope format:

**Success:**

	{
		"status": "success",
		"data" : {
			"foo": "bar",
			"baz": "qux"
		}
	}

**Fail ( or Error ):**

	{
		"status": "fail",
		"message": "failure message."
	}

**Example:**

	amplify.request.define( "decoderSingleExample", "ajax", {
		url: "/myAjaxUrl",
		type: "POST",
		decoder: function ( data, status, xhr, success, error ) {
			if ( data.status === "success" ) {
				success( data.data );
			} else if ( data.status === "fail" || data.status === "error" ) {
				error( data.message, data.status );
			} else {
				error( data.message , "fatal" );
			}
		}
	});

	amplify.request({
		resourceId: "decoderSingleExample",
		success: function( data ) {
			data.foo; // bar
		},
		error: function( message, level ) {
			alert( "always handle errors with alerts." );
		}
	});

## Handling Status


### Status in Success and Error Callbacks

`amplify.request` comes with built in support for status. The status
parameter appears in the default success or error callbacks when using
an ajax definition.

	amplfiy.request.define( "statusExample1", "ajax", {
		//...
	});
	
	amplify.request({
		resourceId: "statusExample1",
		success: function( data, status ) {
		},
		error: function( data, status ) {
		}
	});

With the success callback, the only default status is `success`.
With the error callback two default statuses are possible: `error` and
`abort`.

### Status Codes and Decoders

When specifying a custom decoder for request definition a status code
will be passed in as a parameter. You can determine results from a request based on
this status. When a success or error callback is executed, the
appropriate status will be set by `amplify.request`.

**A basic decoder example:**

	amplfiy.request.define( "statusExample2", "ajax", {
		decoder: function( data, status, xhr, success, error ) {
			if ( status === "success" ) {
				success( data );
			} else {
				error( data );
			}
		}
	});
	
	amplify.request({
		resourceId: "statusExample2",
		success: function( data, status ) {
			// status will be "success"
		},
		error: function( data, status ) {
			// status could be "error" or "abort"
		}
	});

**A request is aborted by using the object returned by a request call:**

	amplfiy.request.define( "statusExample3", "ajax", {
		//...
	});
	
	var myRequest = amplify.request({
		resourceId: "statusExample3",
		success: function( data, status ) {
			// status will be "success"
		},
		error: function( data, status ) {
			// status could be "abort"
		}
	});
	
	// sometime later in code
	myRequest.abort();

### Subscribing to status events

For an alternative to handling issues and statuses you can subscribe to a series of
globally available message that are published during the request
process.

	subscribe( "request.error", function callback );

Subscribe a function to be executed when any error callback is invoked
for any request.

	subscribe( "request.success", function callback );

Subscribe a function to be executed when any success callback is invoked
for any request.

	subscribe( "request.complete", function callback );

Subscribe a function to be executed when any request complete,
regardless of error or success.

The subscriptions and statuses can be used to create issue handlers:

	subscribe( "request.error", function( settings, data, status ) {
		if ( status === "abort" ) {
			// deal with explicit abort of request
		} else {
			// deal with normal error
		}
	});

### Statuses with jsend

The jsend request type has an extra default status. The [jsend
spec](http://labs.omniti.com/labs/jsend) includes a fail status. If a
jsend fail occurs, the error callback ( and appropriate error
subscriptions ) will be called with a status of `fail`.

### Customizing statuses

When calling a success or error callback through a decoder you can
specify a custom status to be sent to the callback as the second
parameter for the callback function.

**An example with a success callback:**

	amplfiy.request.define( "customStatusExample", "ajax", {
		decoder: function( data, status, xhr, success, error ) {
			var customStatus = status;
			if ( someWarningCondition ) {
				customStatus = "warning";
			}
			success( data, "warning" )
		}
	});
	
	amplify.request({
		resourceId: "customStatusExample",
		success: function( data, status ) {
			// status could be "success" or "warning"
		}
	});


**An example with an error callback:**

	amplfiy.request.define( "customStatusExample2", "ajax", {
		decoder: function( data, status, xhr, success, error ) {
			var customStatus = status;
			if ( status === "error" && someCriticalCondition ) {
				customStatus = "zomg";
			}
			if ( status != "success" ) {
				error( data, customStatus );
			}
		}
	});
	
	amplify.request({
		resourceId: "customStatusExample2",
		error: function( data, status ) {
			// status could be "error", "abort", or "zomg"
		}
	});


[requestTypes]: #request_types "request types"
[cache]: #cache "caching"
[decoder]: #decoders "decoders"
[examples]: #examples "examples"
[handlingstatus]: #handling_status "handling status"