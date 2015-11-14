var minimist  = require('minimist');
var log = require('./log');

var _argv = minimist(process.argv.slice(1));

log.debug ('orig args = ' + JSON.stringify(process.argv, null, 2));
log.debug ('args = ' + JSON.stringify(_argv, null, 2));
var args = {};
args.session_server_ip = function () {
	return _argv['sess-ip'];
};

module.exports = args;
