var WebSocketServer = require('ws').Server;
var $               = require('jquery-deferred');
var log             = require("../common/log");
var config          = require("../config");
var auth            = require("./auth");
var resources       = require("./resources");
var protocol        = require("./protocol");
var users           = require("./users");
var addr            = require("./addr");
var connection      = require('./connection');

connection.events.on ('closed', function (user) {
	handle_user_remove (user);
});

controller = {};
controller.process = function (conn, from, to, msg) {

	var _d = $.Deferred ();
	/*
	 * format of addresses (from/to):
	 * 		resourceA[:instanceA][resourceB[:instanceB]] ... */

	var _to = addr.inspect_top(to);

	switch (_to.resource) {

		case 'auth' :

			handle_auth (_d, conn, from, msg);
			break;

		default :
			log.error ('illegal to.resource = ' + to.resource);
			_d.reject ('illegal to.reource', 'controller');
			return _d.promise ();
	}

	return _d.promise ();
};

function handle_auth (_d, conn, from, msg) {

	var user = protocol.get_user_from_addr (from);

	/*
	 * 'auth' is the first PDU we get when a new user 
	 *  connects. */

	if (!user)
		return _d.reject ('no user', 'auth');

	if (!users.add_user (user, conn))
		return _d.reject ('कितनी बार आओगे ?', 'auth');

	if (!auth.process (user)) {
		users.remove_user (user);
		return _d.reject ('auth failed', 'auth');
	}

	if (!conn.set_user (user)) {
		users.remove_user (user);
		return _d.reject ('internal error', 'connection');
	}

	resources.init_user (user)
		.then (
			function (info) {
				_d.resolve (info);
				users.broadcast_info ('controller', null, 'new-johnny', user, user);
			}
		);

}

function handle_user_remove (user) {
	users.remove_user (user);
	users.broadcast_info ('controller', null, 'johnny-go-went-gone', user, null);
}

module.exports = controller;
