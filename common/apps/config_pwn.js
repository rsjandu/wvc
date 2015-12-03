/* var fs  = require('fs'); */
/* var path= require('path'); */
/* var log = require('./common/log'); */
var config = {};

/*
 *	Log related Configs
 */
config.log_tag			= 'vc.apps';
config.log_type			= 'forward';
/* Rishikesh is where all the log streams meet */
config.rishikesh_ip 	= '127.0.0.1';
config.rishikesh_port	= '24224';

/*
 * Path related configs
 */
/*
 * config.top   = __dirname;
 * config.session_server = { default_port : 3179 };
*/

module.exports = config;
