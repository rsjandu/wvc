var WebSocketServer = require('ws').Server;
var log             = require("../common/log");
var config          = require("../config");
var protocol        = require("./protocol");
var cc              = require("./cc");

auth = {};
auth.process = function (_m) {
	/*
	 * For now, just send back ok.
	 */
	log.info ('auth request : ' + JSON.stringify(_m.m, null, 2));

	_m.ack('ok', 'तथास्तु');
};

module.exports = auth;
