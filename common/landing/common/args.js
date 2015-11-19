var minimist  = require('minimist');
var log = require('./log');

var _argv = minimist(process.argv.slice(2));

log.debug ('args = ' + JSON.stringify(_argv, null, 2));
var args = {};

args.session_server_ip = function () {
	return _argv['sess-ip'];
};

args.session_server_port = function () {
	return _argv['sess-port'];
};

args.session_server_ssl = function () {
	return _argv['ssl'];
};

module.exports = args;
