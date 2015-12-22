var bunyan 				= require('bunyan');
var config 				= require('common/config');
var fluent       		= require('fluent-wiziq');

var log;

function connect_to_fluent_server () {

	var flogger;

	flogger = new fluent ({ 
			tag  : config.log.tag, 
			type : config.log.type, 
			host : config.log.rishikesh_host, 
			port : config.log.rishikesh_port
		},
		function () {
			log.info ('connected to fluentd server @ ' + config.rishikesh_ip + ':' + config.rishikesh_port);
			log.addStream(flogger, 'info');
		});
	flogger.writeStream.on ('error', function (err) {
			log.error (err, 'fluentd connection error');
		} );
}

log = bunyan.createLogger ({ name : 'vc',
			streams : [
				{
					stream : process.stdout,
					level  : 'debug'
				}
			]
		});

connect_to_fluent_server ();

module.exports = log;
