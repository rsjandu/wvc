var server = require('http').createServer();
var url = require('url');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server });
var express = require('express');
var app = express();
var log = require("../common/log");
var config = require("../config");
var port = config.session_server.default_port;

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

wss.on('connection', function connection (ws) {
	var location = url.parse (ws.upgradeReq.url, true);

	log.info ('Incoming connectin from ' + ws.options);

	ws.on('message', function incoming (message) {
		log.info ('message: ', message);

		if (message == 'कइसन हो भईया ?') {
			log.info ('responding with : ' + 'ठीक ठाक हैं । आपके क्या हाल हैं ?');
			ws.send ('ठीक ठाक हैं । आपके क्या हाल हैं ?');
		}
	});

	ws.on('error', function incoming(err) {
		log.error ('error : %s', err);
	});
});

server.on('request', app);
server.listen(port, function () {
	log.info ('*---------------- Session Server Cluster -------------*');
	log.info ('*    Env =', process.env.NODE_ENV);
	log.info ('*    Addr :' + server.address().port);
	log.info ('*    Port : ' + port);

});
