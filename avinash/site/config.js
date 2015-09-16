var fs  = require('fs');
var path= require('path');
var log = require('./common/log');
var config = {};

config.port = '2178';

/*
 * Path related configs
 */
config.top   = __dirname;
config.views = path.join(config.top, 'views');

function determine_site_addr () {
		fs.readFile('/etc/hostname', function (err, data) {


			if (err) {
				log.warn ('*******************************************************');
				log.warn ('* Error reading /etc/hostname !                       *');
				log.warn ('* The runtime Environment maybe not be set correctly. *');
				log.warn ('* Assuming Local Development evnironment.             *');
				log.warn ('*******************************************************');

				host = 'localhost:' + config.port;
				proto = 'http';
			}
			else {
				host = data.toString().trim();
				proto = 'https';
			}

			config.site_addr = proto + '://' + host;
			log.warn ('* Setting Site address to ' + config.site_addr + ' *');
		});
}

determine_site_addr ();

module.exports = config;
