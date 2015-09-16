define(function(require) {
	var log       = require('log')('cc', 'info');

	var cc = {};

	var sock;
	var host;
	var port;
	var server;
	var _d_auth_promise;
	var _sess_config;

	cc.init = function (sess_config) {

		var _d = $.Deferred ();

		_sess_config = sess_config;

		host = sess_config.session_server.host;
		port = sess_config.session_server.port;
		server = 'ws://' + host + ':' + port;

		log.info ('Connecting to ' + server + ' ...');
		sock = new WebSocket (server, 'http');
		sock.onopen = on_open.bind(_d, sess_config);
		sock.onmessage = on_message;
		/*
		sock.onerror = on_error;
		sock.onclose = on_close;
		*/

		return _d.promise();
	};

	cc.auth = function (sess_config) {
		
		_d_auth_promise = $.Deferred ();
		/*
		 * Do the auth thingy here
		 *
		 */
		log.info ('Auth to ws://' + host + ':' + port);

		sock.send ('कइसन हो भईया ?');

		return _d_auth_promise.promise();
	};

	/*----------------------------------------------------------------
	 * Internals
	 *----------------------------------------------------------------*/

	function on_open (sess_config) {
		log.info ('Websocket connection to ' + server + ' 	ok');
		this.resolve (sess_config);
	}

	function on_message (e) {
		log.info ('on_message : ' + e.data);

		if (e.data === 'ठीक ठाक हैं । आपके क्या हाल हैं ?')
			return _d_auth_promise.resolve(_sess_config);
	}

	return cc;
});
