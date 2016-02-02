var $          = require ('jquery-deferred');
var proxy      = require ('./proxy');
var host       = require ('./args');
var log        = require ('./common/log');
var route_list = require ('./route-list');
var cache      = require ('./common/cache');

var cached_routes = {};
var _d            = $.Deferred();

/*
 * Get the keys stored in redis cache and register routes */

cached_routes.get = function (namespace){
	cache.getall(namespace).then(register, _d.reject.bind(_d));
	return _d.promise();
};

function register (val){
	var keys = val;
	log.info({keys : keys}, "proxy-keys");
	for (var i=0; i<keys.length; i++){
		configure_proxy(i, keys.length, keys[i].substring(14));
	}
}

function configure_proxy (index, length, key){
	cache.get(key).then(function (value){
		proxy.register(host + key, value);
		route_list.add_route(key, value);
		if(index === length-1) // Resolve when all keys have been retrieved
			_d.resolve();
	});
}

module.exports = cached_routes;
