var minimist  = require('minimist');
var log = require('common/log');

var _argv = minimist(process.argv.slice(2));

log.debug ({ args : _argv}, 'command line arguments');
var args = {};

args.session_server_ip = function () {
	var val = _argv['sess-ip'];
	if (!val)
		val = process.env.VC_SESS_IP;
	return val;
};

args.session_server_port = function () {
	var val = _argv['sess-port'];
	if (!val)
		val = process.env.VC_SESS_PORT;
	return val;
};

args.session_server_ssl = function () {
	return _argv.ssl;
	var val = _argv['ssl'];
	if (!val)
		val = process.env.VC_SSL;
	return val;
};

module.exports = args;
