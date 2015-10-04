var WebSocketServer = require('ws').Server;
var $               = require("jquery-deferred");
var log             = require("../common/log");
var config          = require("../config");
var protocol        = require("./protocol");

var wss;

var cc = {};
var upstream;
var seq = 1;

cc.init = function (server, route, sess_config) {

	upstream = route;
	/*
	 * Init the server socket. Only one for now. */
	var wss = new WebSocketServer({ 
		server: server,
		verifyClient : verify
	});

	wss.on('connection', function (ws) {

		/* Add connection to list */
		upstream.new_connection (ws);

		ws.on ('message', function (message) {
			handle_incoming (ws, message);
		});

		ws.on ('error', function (err) {
			log.error ('error : %s', err);
		});

		ws.on ('close', function (err) {
			upstream.close (ws);
		});
	});
};

cc.send_info = function (sock, from, to, info_id, info) {
	var m = protocol.info_pdu (from, to, info_id, info);
	if (!m)
		return;

	m.seq = seq++;
	sock.send (JSON.stringify(m));
	protocol.print(m);
};

function verify (info, callback) {
	callback (true, 0, null);
}

function handle_incoming (ws, message) {
	try {
		m = protocol.parse (message);
	}
	catch (e) {
		log.error ('protocol parse error : ' + e.message);
		log.error ('    message = ' + JSON.stringify(message, null, 2));
		log.error ('    message = ', message);
		return;
	}

	protocol.print(m);

	switch (m.type) {

		case 'req':
			upstream.route_req (ws, m.from, m.to, m.msg)
				.then (
					function (data) {
						ack (ws, m, data);
					},
					function (data, from) {
						nack (ws, m, data, from);
					}
				);

			break;

		case 'info':
			upstream.route_info (ws, m.from, m.to, m.msg);
			break;
	}
}

function ack (sock, _m, data) {
	return __ack (sock, _m, 'ok', data);
}

function nack (sock, _m, data, from) {
	return __ack (sock, _m, 'not-ok', data, from);
}

function __ack (sock, _m, status, data, from) {
	var m = protocol.ack_pdu (_m, status, data, from);

	m.seq = _m.seq;
	sock.send(JSON.stringify(m));

	protocol.print(m);
}

module.exports = cc;
