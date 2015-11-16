define(function(require) {
	var identity  = require('identity');
	var protocol  = require('protocol');
	var log       = require('log')('cc', 'info');

	var cc = {};

	var sock;
	var host;
	var port;
	var server;
	var seq = 0;
	var _d_auth_promise;
	var _sess_config;
	var _req_channel;
	var msg_q = {};

	cc.init = function (framwork_handle, sess_config) {

		log.info ('init : args = ', sess_config);
		var _d = $.Deferred ();

		_sess_config = sess_config;
		_req_channel = framwork_handle;

		host = sess_config.session_server.host;
		port = sess_config.session_server.port;
		url  = sess_config.session_server.url;
		server = 'ws://' + host + ':' + port + '/session/' + url;

		log.info ('Connecting to ' + server + ' ...');
		sock = new WebSocket (server, 'http');
		sock.onopen = on_open.bind(_d, sess_config);
		sock.onmessage = on_message;
		sock.onerror = on_error;
		sock.onclose = on_close;

		return _d.promise();
	};

	cc.auth = function (sess_config) {
		
		log.info ('Auth to ws://' + host + ':' + port);

		var from = 'user:' + identity.name;
		var message = protocol.auth_pdu ('controller.auth', from, {});

		message.seq = seq++;

		return send (message, true);
	};

	cc.send_command = function (to, sub_resource, op, from_module) {
		var _d = $.Deferred ();
		var from = 'user:' + identity.name + 'resource:' + from_module;

		var message = prot.command_pdu (to, sub_resource, op, from);
		if (!message) {
			_d.reject ('protocol parse error');
			return _d.promise ();
		}

		message.seq = ++seq;

		send (message, true)
			.then (
				_d.resolve.bind(_d),
				_d.reject.bind(_d)
			);

		return _d.promise ();
	};

	cc.send_info = function (from, to, id, data) {
		
		var message = protocol.info_pdu (from, to, id, data);

		if (!message)
			return;

		message.seq = seq++;

		return send (message, false);
	};


	/*----------------------------------------------------------------
	 * Internals
	 *----------------------------------------------------------------*/

	function send (message, ack) {
		var _d;

		if (ack) {
			/*
			 * If an ACk is required then create and store
			 * a deferred, indexed by the sequence number of
			 * the message */

			_d = $.Deferred ();
			msg_q[message.seq] = {};
			msg_q[message.seq]._d = _d;
		}

		sock.send (JSON.stringify(message));

		if (ack)
			return _d.promise ();

		return true;
	}

	function on_open (sess_config) {
		log.info ('Websocket connection to ' + server + ' 	ok');
		this.resolve (sess_config);
	}

	function on_message (e) {
		var message;

		try {
			message = protocol.parse (e.data);
		}
		catch (ex) {
			log.error ('protocol error = ', ex);
			return;
		}

		/* is the message addressed to me ? */
		if (!addressed_to_me (message.to)) {
			log.error ('RX: illegal to addr (' + message.to + '): message = ', message);

			if (message.type === 'req')
				ack (message, 'error', 'not my problem');

			return;
		}

		/*
		 * remove the 'user:xxx', since noone downstream needs to 
		 * know that */

		message.to = message.to.replace(/^user:[^.]+\./, '');

		switch (message.type) {
			case 'ack' : 
				process_ack (message); 
				break;
			case 'info' : 
				deliver_info (message); 
				break;
			case 'req' : 
				deliver_req (message); 
				break;
			default : 
				log.error ('RX: illegal type (' + message.type + '): message =', message);
		}

		return;
	}

	function on_error () {
		log.error ('socket error : NOT IMPLEMENTED');
	}

	function on_close () {
		log.error ('socket close : NOT IMPLEMENTED');
	}

	function addressed_to_me (to) {
		var _to = to.split('.')[0].split(':');

		if ((_to[0] === 'user') && (_to[1] == identity.name))
			return true;

		return false;
	}

	function process_ack (message) {
		var seq = message.seq;
		var msg = message.msg;

		if (!msg_q[seq] || !msg_q[seq]._d) {
			log.error ('RX: ACK: seq (' + seq + ') does not exist: message = ', message);
			return;
		}

		switch (msg.status) {
			case 'ok':
				msg_q[seq]._d.resolve(msg.data);
				break;

			case 'error':
				msg_q[seq]._d.reject(msg.data);
				break;

			default :
				log.error ('RX: ACK: illegal status (' + msg.status + '): message = ', message);
				break;
		}

		delete msg_q[seq];
	}

	function deliver_req (message) {

		var seq = message.seq;

		/*
		 * The _req_channel is essentially the framework. We expect
		 * it to return us a promise. TODO: Add a time out here. */

		_req_channel.rx_req (message)
			.then (
				function (data) {
					return ack (message, 'ok', data);
				},
				function (err) {
					return ack (message, 'error', err);
				}
			);
	}

	function deliver_info (message) {

		/*
		 * The _req_channel is essentially the framework. Since this
		 * is an 'info' type message, which requires no ACK, we don't
		 * expect any promise from the framework. */

		_req_channel.rx_info (message.from, message.to, message.msg.info_id, message.msg.info);
	}

	function ack (m, status, data) {
		var message = protocol.ack_pdu (message, status, data);

		message.seq = m.seq;

		sock.send (JSON.stringify(message));

		return;
	}

	return cc;
});
