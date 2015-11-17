var express = require('express');
var proxy   = require('redbird')({ port: 443 });
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

proxy.register(host + ':' + ext_port, "localhost:" + int_port);
