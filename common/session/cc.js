var WebSocketServer = require('ws').Server;
var log             = require("../common/log");
var config          = require("../config");
var protocol        = require("./protocol");
var connection      = require("./connection");

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
		ws.conn_handle = new connection (ws);

		ws.on ('message', function (message) {
			handle_incoming (ws, message);
		});

		ws.on ('error', function (err) {
			log.error ('error : %s', err);
		});

		ws.on ('close', function (err) {
			ws.conn_handle.close ();
		});
	});
};

cc.send_info = function (sock, to_user, to_module, from_module, info_id, info) {
	var m = protocol.info_pdu (to_user, to_module, from_module, info_id, info);
	m.seq = seq++;
	sock.send (m);
	log.debug ('sent info: ' + JSON.stringify(m, null, 2));
	protocol.print(m);
	sock.conn_handle.show();
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

	protocol.print(m);

	var _m = {
		m          : m,
		sock       : ws,
		nack       : nack,
		ack        : ack
	};

	upstream.route (_m);
}

function nack (from_module, info_id, info) {

	switch (this.m.type) {
		case 'req' :
			this.ack ('error', info);
			break;

		/*
		 * If this wasn't a request then the originator of this 
		 * message isn't expecting an ACK. Just construct an unsolicited INFO
		 * message and send. */

		default :
			var to_user = this.m.to.ep.i;
			var to_module = this.m.to.ep.res;
			if (!to_user || !to_module) {
				log.warn ('no user/module to send_error to');
				log.warn ('    message = ' + JSON.stringify(this.m, null, 2));
				return;
			}

			var m = prot.info_pdu (to_user, to_module, from_module, info_id, info);
			var sock = this.sock;

			m.seq = seq++;
			sock.send (JSON.stringify(m));
			log.debug ('sent nack (info)');
			protocol.print(m);
	}
}

function ack (status, data) {
	var m = protocol.ack_pdu (this.m, status, data);
	var sock = this.sock;

	m.seq = this.m.seq;
	sock.send(JSON.stringify(m));

	log.debug ('sent ack');
	protocol.print(m);
}

module.exports = cc;
