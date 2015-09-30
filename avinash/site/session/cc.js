var url             = require('url');
var WebSocketServer = require('ws').Server;
var log             = require("../common/log");
var config          = require("../config");
var route           = require("./msg-route");
var sess_config     = require("./sess-config");
var protocol        = require("./protocol");
var route           = require("./msg-route");

var wss;

function Message (sock, m) {
	var _ = {
		sock       : sock,
		m          : m,
		ack        : ack,
		send_error : send_error,
	};

	return _;
}

var cc = {};

cc.init = function (server, sess_config) {
	/*
	 * Init the server socket. Only one for now. */
	var wss = new WebSocketServer({ 
		server: server,
		verifyClient : verify
	});

	wss.on('connection', function connection (ws) {
		var location = url.parse (ws.upgradeReq.url, true);

		ws.on ('message', function (message) {
			handle_incoming (ws, message);
		});

		ws.on ('error', function (err) {
			log.error ('error : %s', err);
		});
	});
};

function verify (info, callback) {
	log.info ('Incoming ' + info.origin + ' ' + info.req.url);
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

	var _m = new Message (ws, m);
	route.route (_m);
}

function ack (status, data) {
	var m = protocol.ack_pdu (this.m, status, data);
	m.seq = this.m.seq;
	this.sock.send(JSON.stringify(m));

	log.debug ('sent ack: ' + JSON.stringify(m, null, 2));
}

function send_error (from_module, info_id, info) {

	switch (this.m.type) {
		case 'req' :
			this.ack ('error', info);
			break;

		default :
			var to_user = this.m.to.ep.i;
			var to_module = this.m.to.ep.res;
			if (!to_user || !to_module) {
				log.warn ('no user/module to send_error to');
				log.warn ('    message = ' + JSON.stringify(msg, null, 2));
				return;
			}

			var m = prot.info_pdu (to_user, to_module, from_module, info_id, info);
			this.sock.send(JSON.stringify(m));
	}
}

module.exports = cc;
