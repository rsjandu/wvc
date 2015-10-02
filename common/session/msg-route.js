var WebSocketServer = require('ws').Server;
var $               = require("jquery-deferred");
var log             = require("../common/log");
var config          = require("../config");
var addr            = require("./addr");
var controller      = require("./controller");

route = {};
route.route_req = function (conn, from, to, msg) {

	var _d = $.Deferred ();
	/*
	 * format of addresses (from/to):
	 * 		resourceA[:instanceA][resourceB[:instanceB]] ... */

	var _to = addr.inspect_top (to);

	switch (_to.resource) {
		case 'user' :
			_d.reject ('not implemented', 'msg-route');
			return;

		case 'controller' :

			controller.process (conn, from, addr.pop(to), msg)
				.then (
					_d.resolve.bind(_d),
					_d.reject.bind(_d)
				);
			break;

		default:
			_d.reject ('bad address', 'msg-route');
			return;
	}

	return _d.promise ();
};

module.exports = route;
