var bunyan 				= require('bunyan');
var config 				= require('../config_pwn.js');
var FluentLogger 		= require('fluent-logger-stream');

var log;
try{
	var fluentLogger = new FluentLogger( 
		{ 
			tag		: config.log_tag, 
			type	: config.log_type, 
			host	: config.rishikesh_ip, 
			port	: config.rishikesh_port
		});
	/* error in connection crashes the server
	 * handle it somehow
	 */
}
catch(e){
	fluentLogger = process.stdout;
}

if (process.env.NODE_ENV !== 'production') {
		
	log = 	bunyan.createLogger({
				name : 'wvc',
				streams : [
					{
						stream 	: fluentLogger,
						level	: 'debug'
					}
				]
			});
	/* src:true i.e. call source is slow..donot use in production */
	log.on('error',function( err, stream){
		/*
		 * Unable to write
		 * either buffer or fall back to std output
		 */
	});
	
	log1 =	bunyan.createLogger ({ 
				name : 'vc',
				streams : [
					{
						stream : process.stdout,
						level  : 'debug'
					}
				]
			});
}

if (process.env.NODE_ENV === 'production') {
}

module.exports = log;
