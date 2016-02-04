var log             = require('./common/log').child ({ 'sub-module' : 'routes-cache'});
var host            = require('./common/args').host;
var proxy           = require('./proxy');

/*
 * Used to update list of routes whenever proxy registers or unregisters */

var m     = {};
var cache = {};

m.add_route = function (key, val) {
	cache[key] = { val : val };
	proxy.register (host + key , val);
};

m.remove_route = function (key) {
	if (cache[key]) {
		delete cache[key];
		proxy.unregister (host + key);
	}
};

m.get_all = function () {
	return cache;
};

m.get = function (key) {
	return cache[key].val;
};

m.exists = function (key) {
	return cache[key] ? true : false;
};

m.matches = function (key, value) {
	if (!cache[key])
		return false;

	return cache[key].val == value ? true : false;
};

module.exports = m;