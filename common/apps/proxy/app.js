var express       = require('express');
var app           = express();
var body_parser   = require('body-parser');
var log           = require('./common/log');
var api           = require('./api');
var cached_routes = require('./cached-routes');
var proxy_api     = require('./proxy-api');
var host          = require('./args');
var cache         = require('../common/cache');
var ext_port      = 443;
var server_port   = 3141;


/*
 * If connected to redis then initialze_proxy otherwise show error */
function route_cache (connected) {
	if (connected === true){
		cached_routes.get('proxy-routes')
			.then(initialize_proxy, initialize_proxy);
	}
	else {
		log.error ('redis connection failed. Exiting ...');
		process.exit (-1);
	}
}

function initialize_proxy (_d) {
//	proxy_api.register_default_routes();
	
	require('./docker-events');

	app.use(body_parser.urlencoded({ extended: false }));
	app.use(body_parser.json());
	app.use(log.req_logger);
	app.use(log.err_logger);

	app.use('/api', api);

	log.info ({
		host : host,
		port : ext_port
	}, 'Starting proxy');
}

app.listen(server_port);
