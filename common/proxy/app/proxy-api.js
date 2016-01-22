var log				= require('./log');
var host			= require('./args');
var proxy			= require('./proxy');
var route_list		= require('./route-list');
var proxy_api		= {};

function key_exists (key) {
	return (route_list.routes[key] !== undefined);
}

function key_val_match (key, val) {
	if (route_list.routes[key].val == val)
		return true;

	return false;
}

proxy_api.register = function (req, res, next) {
	var key   = req.body.key;
	var value = req.body.value;

	log.info ( { key: key, value : value }, 'register route');

	if (key_exists(key)) {
		if (key_val_match(key, value))
			return res.status(200).send('route already registered');

		/* The value is different for the same key so update value */
		proxy.unregister (host + key);
		route_list.remove_route(key);
	}

	proxy.register(host + key , value);
	route_list.add_route (key, value);

	return res.status(200).send('route registered');
};


proxy_api.unregister = function (req, res, next) {
	var key = req.body.key;

	log.info ( { key: key }, 'unregister route');

	if (!key_exists(key)) {
		return res.status(404).send('route not found');
	}

	proxy.unregister(host + key);
	route_list.remove_route(key);

	res.status(200).send('route unregistered');
};

proxy_api.list = function (req, res, next) {
	res.status(200).send(route_list.routes);
};

/*
 * Routes for the landing page */
proxy.register(host + '/landing', "localhost:2178/landing/");
route_list.add_route('/landing', "localhost:2178/landing/");
proxy.register(host + '/auth', "localhost:2178/auth/");
route_list.add_route('/auth', "localhost:2178/auth/");
/*
 * Routes for the chat and log server */
proxy.register(host + '/', "localhost:5000/");
route_list.add_route('/', "localhost:5000/");
proxy.register(host + '/socket.io', "localhost:5000/socket.io/");
route_list.add_route('/socket.io', "localhost:5000/socket.io/");
proxy.register(host + '/log', "localhost:24224/");
route_list.add_route('/log', "localhost:24224/");

module.exports = proxy_api;
