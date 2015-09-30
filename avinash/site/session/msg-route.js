var WebSocketServer = require('ws').Server;
var log             = require("../common/log");
var config          = require("../config");
var protocol        = require("./protocol");
var controller      = require("./controller");

route = {};
route.route = function (_m) {

	/*
	 *
	 * REMEMBER 
	 * 	TO CONVERT ALL '*' TO ADDRESSES TO SPECIFIC ADDRESSES
	 *
	 */
	switch (_m.m.to.ep.t) {
		case 'user' :
			_m.send_error ('msg-route', 'error', 'not implemented');
			return;

		case 'controller' :
			controller.process (_m);
			break;

		default:
			_m.send_error ('msg-route', 'error', 'unknown recipient');
			return;
	}
};

module.exports = route;
