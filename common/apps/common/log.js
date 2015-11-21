var bunyan = require('bunyan');

var log;

if (process.env.NODE_ENV !== 'production') {
		
	log = bunyan.createLogger ({ 
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
