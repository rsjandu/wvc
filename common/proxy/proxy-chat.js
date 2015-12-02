var express = require('express');
var proxy   = new require('redbird')({
	ssl : {
		port : 443,
		key : '/etc/ssl/private/server.key',
		cert : '/etc/ssl/certs/server.crt'
	}
});
var app = express();

if (!process.argv[2]) {
	console.log ('Usage: node proxy-chat.js <hostname>');
	process.exit (1);
}

var host = process.argv[2];
var ext_port = 443;

console.log ('Starting proxy for CHAT server @ ' + host + ':' + ext_port);

/*
 * Routes for the landing page */
proxy.register(host + '/landing/', "localhost:2178/landing/");
/*
 * Routes for the session cluster docker for 'test-internal' */
proxy.register(host + '/session/test-internal', "localhost:7777/");

proxy.register(host + '/lets-chat/', "localhost:5000/");
