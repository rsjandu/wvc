var docker_monitor = require('node-docker-monitor');
var log            = require('./log');
var host           = require('./args');

var proxy   = new require('redbird')({
	port : 80,
	ssl : {
		port : 443,
	key  : 'certificates/dev-key.pem',
	cert : 'certificates/dev-cert.pem',
	}
});

var proxy_api = {};

function dockermonitor(){

	docker_monitor({
		onContainerUp: function(container) {
			log.info('Container up::::: ', JSON.stringify(container));
			log.info('container Name::'+container.Name);
			log.info('container Port::'+container.Ports[0].PublicPort);
			proxy.register(host + '/session/'+container.Name, "localhost:"+container.Ports[0].PublicPort);
			log.info('registered:::https://'+host+'/landing/session/v1/'+container.Name);
		},

		onContainerDown: function(container) {
			log.info('Container down:::: ',JSON.stringify(container));
			proxy.unregister(host + '/session/'+container.Name);
			log.info('unregistered:::https://'+host+"/landing/session/v1/"+container.Name);
			log.info('container Name:::'+container.Name);
			log.info('container port:::'+container.Ports[0].PublicPort);
		}
	});
}

dockermonitor();

var routes_list = {};

function add_route (key, val) {
	route_list[key] = {
		val : val
	};

	return route_list[key];
}

function remove_route (key, val) {
	if (route_list[key])
		delete route_key[key];
}

function key_exists (key) {
	return (route_list[key] !== null);
}

function key_val_match (key, val) {
	if (route_list[key] === null)
		return false;

	if (route_list[key].val == val)
		return true;

	return false;
}

proxy_api.register = function (req, res, next) {
	var key = req.body.key;
	var value = req.body.value;

	log.info ( { key: key, value : value }, 'new route');

	if (key_exists(key)) {
		if (key_val_match(key, value))
			return res.status(200).send();

		/* The value is different for the same key */
		proxy.unregister (host + key);
	}

	proxy.register(host + key , value);
	add_route (key, value);

	return res.sendStatus(200);
};


proxy_api.unregister = function (req, res, next) {
	var key = req.body.key;
	var value = req.body.value;

	log.info ( { key: key, value : value }, 'unregister route');

	if (!key_exists(key)) {
		return res.status(404).send('route not found');
	}

	proxy.unregister(host + key);
	remove_route (key);

	res.sendStatus(200);
};

proxy_api.list = function (req, res, next) {
	res.status(200).send(routes_list);
};

/*
 * Routes for the landing page */
proxy.register(host + '/landing/', "http://localhost:2178/landing/");
proxy.register(host + '/auth/', "http://localhost:2178/auth/");

/*
 * Routes for the session cluster docker for 'test-internal' */

proxy.register(host + '/', "localhost:5000/");
proxy.register(host + '/socket.io/', "localhost:5000/socket.io/");
proxy.register(host + '/log', "localhost:24224/");

module.exports = proxy_api;
