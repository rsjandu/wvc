var WebSocketServer = require('ws').Server;
var log             = require("../common/log");
var config          = require("../config");
var auth            = require("./auth");
var resources       = require("./resources");
var users           = require("./users");
var cc              = require("./cc");

controller = {};
controller.process = function (_m) {

	switch (_m.m.to.res) {

		case 'auth' :

			var user = _m.m.from.ep.i;
			/*
			 * 'auth' is the first PDU we get when a new user 
			 *  connects. The 'from' should identify the user. */

			if (!users.add_user (user, _m.sock))
				return _m.nack('error', 'कितनी बार आओगे ?');

			auth.process (user);
			_m.sock.conn_handle.set_user (user);

			resources.notify ('auth', _m.m.from);
			_m.ack('ok', 'तथास्तु');

			users.all_but (user).forEach (function (curr) {
				var sock = curr.sock;
				cc.send_info (sock, curr.user, 'framework', 'auth', 'new-entry', curr.user);
			});

			break;

		default :
			log.error ('illegal to.res = ' + _m.m.to.res);
			log.error ('    message = ' + JSON.stringify(_m.m, null, 2));
			_m.send_error ('controller', 'error', 'illegal to.res');
			return;
	}
};

module.exports = controller;
