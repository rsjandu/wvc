var server          = require('http').createServer();
var url             = require('url');
var WebSocketServer = require('ws').Server;
var express         = require('express');
var app             = express();
var log             = require("../common/log");
var config          = require("../config");
var sess_config     = require("./sess-config");
var cc              = require("./cc");
var resources       = require("./resources");
var connection      = require("./connection");
var port            = config.session_server.default_port;

function start () {
	var file = process.argv[2];
	if (!file) {
		log.error ('Need a session configuration file. For now.');
		process.exit(1);
	}

	sess_config.load (file, function (err, data) {
		if (err) {
			log.error ('sess_config.load: err = ' + err);
			return;
		}

		resources.load (data);
		cc.init (server, connection, data);
	});
}

server.on('request', app);
server.listen(port, function () {
	log.info ('*---------------- Session Server Cluster -------------*');
	log.info ('*    Env  = ', process.env.NODE_ENV);
	log.info ('*    Addr : ' + server.address().port);
	log.info ('*    Port : ' + port);

});

start ();
