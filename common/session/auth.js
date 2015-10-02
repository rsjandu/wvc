var WebSocketServer = require('ws').Server;
var log             = require("../common/log");
var config          = require("../config");
var protocol        = require("./protocol");
var cc              = require("./cc");

auth = {};
auth.process = function (user) {
	/*
	 * For now, just send back ok.
	 */
	log.info ('auth request for \"' + user + '\" ok');
	return true;
};

module.exports = auth;
