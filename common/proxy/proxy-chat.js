var express = require('express');
var proxy   = new require('redbird')({
	ssl : {
		port : 443,
		key : '/etc/ssl/private/server.key',
		cert : '/etc/ssl/certs/server.crt'
	}
});
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
	console.log ('Usage: node proxy-chat.js <hostname> <ext-port> <int-port>');
	process.exit (1);
}

var host = process.argv[2];
var ext_port = process.argv[3];
var int_port = process.argv[4];

console.log ('Starting proxy for CHAT server @' + host + ':' + ext_port + ' -> localhost:' + int_port);

/*
 * Routes for the landing page */
proxy.register(host + '/landing/', "localhost:2178/landing/");

/*
 * Routes for the session cluster docker for 'test-internal' */
proxy.register(host + '/session/test-internal', "localhost:7777/");

proxy.register(host, "localhost:" + int_port);
