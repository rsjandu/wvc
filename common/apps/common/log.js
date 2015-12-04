var bunyan 				= require('bunyan');
var config 				= require('../config_pwn.js');
var fluent       		= require('fluent-wiziq');

var log;

function connect_to_fluent_server () {

	var flogger;

	flogger = new fluent ({ 
			tag  : config.log_tag, 
			type : config.log_type, 
			host : config.rishikesh_ip, 
			port : config.rishikesh_port
		}, function () {
			log.addStream(flogger, 'debug');
		});
	flogger.writeStream.on ('error', function (err) {
			log.error (err, 'fluentd connection error');
		} );
}

if (process.env.NODE_ENV !== 'production') {
	log =	bunyan.createLogger ({ 
				name : 'vc',
				streams : [
					{
						stream : process.stdout,
						level  : 'debug'
					}
				]
			});
}

connect_to_fluent_server ();

if (process.env.NODE_ENV === 'production') {
}

module.exports = log;
