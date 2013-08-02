'use strict';
var strata = require('strata'),
	HEADERS = require('./headers'),
	_ = require('underscore');

function getCallbackFunctionName(queryString, key) {
	queryString = queryString || '';
	key = key || 'callback';
	var pairs = queryString.split('&');
	var parts = _.map(pairs, function (pair) {
		pair = pair.split('=');
		return {key: pair[0], value: pair[1]};
	});
	var callbackParam = _.find(parts, function (part) {
		return part.key === key;
	}) || {};
	return callbackParam.value || '';
}

module.exports = function (callback) {
	strata.get('/test/request/jsonp', function (env, callback) {
		if (env.queryString.length === 0) {
			return callback(400, HEADERS.text, 'query string is missing');
		}
		var callbackFunction = getCallbackFunctionName(env.queryString);
		if (!callbackFunction) {
			return callback(400, HEADERS.text, 'no `callback` param specified in query string');
		}
		var data = callbackFunction + '(' + JSON.stringify({foo: 'bar'}) + ')';
		callback(200, HEADERS.text, data);
	});

	strata.get('/test/request/jsonp/:callbackKey', function (env, callback) {
		if (env.queryString.length === 0) {
			return callback(400, HEADERS.text, 'query string is missing');
		}
		var callbackKey = env.route.callbackKey;
		var callbackFunction = getCallbackFunctionName(env.queryString, callbackKey);
		if (!callbackFunction) {
			return callback(400, HEADERS.text, 'no `' + callbackKey + '` param specified in query string');
		}
		var data = callbackFunction + '(' + JSON.stringify({foo: 'bar'}) + ')';
		callback(200, HEADERS.text, data);
	});

	callback(null);
};