var WebSocketServer = require('ws').Server;
var log             = require("../common/log");
var config          = require("../config");
var auth            = require("./auth");

controller = {};
controller.process = function (_m) {

	switch (_m.m.to.res) {

		case 'auth' :
			auth.process (_m);
			break;

		default :
			log.error ('illegal to.res = ' + _m.m.to.res);
			log.error ('    message = ' + JSON.stringify(_m.m, null, 2));
			_m.send_error ('controller', 'error', 'illegal to.res');
			return;
	}
};

module.exports = controller;
