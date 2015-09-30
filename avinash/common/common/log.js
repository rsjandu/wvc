var winston = require('winston');

var log;
var levels = {
		'important' : 6,
		'fatal' : 5,
		'error' : 4,
		'warn'  : 3,
		'info'  : 2,
		'news'  : 1,
		'debug' : 0
};

var colors = {
		'important' : 'magenta',
		'fatal' : 'red',
		'error' : 'red',
		'warn'  : 'yellow',
		'info'  : 'green',
		'news'  : 'cyan',
		'debug' : 'white'
};

log = new (winston.Logger)({
				levels : levels,
		});
winston.addColors(colors);

if (process.env.NODE_ENV !== 'production') {
		
		/* Add console */
		log.add(winston.transports.Console, {
						level : 'debug',
						colorize : 'all',
						timestamp : true,
						humanReadableUnhandledException : true,
				});

}

if (process.env.NODE_ENV === 'production') {

		/* Add file rotater */
		log.add(winston.transports.DailyRotateFile, {
						level : 'info',
						colorize : false,
						timestamp : true,
						filename : 'logs/impact.log-',
						//maxsize : 51200, /* 50 KB */
						datePattern : 'yyyy-MM-dd',
						prettyPrint : true,
						maxFiles : 20,
						json : false,
						showLevel : true,
						tailable : true,
						maxRetries : 1,
						humanReadableUnhandledException : true,
				});
}

module.exports = log