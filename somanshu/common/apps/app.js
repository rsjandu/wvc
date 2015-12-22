/*
 * To avoid the ../../ mess */
require('app-module-path').addPath(__dirname);

var express         = require('express');
var path            = require('path');

var log             = require('common/log');
var log_middleware  = require('common/log-middleware');
var tracker         = require('common/tracker');
var config          = require('common/config');
var landing         = require('landing/app');
var api             = require('api-backend/app');
var prov            = require('provisioning/app');

log.info ('Starting main app');
var app = express();

/* Load middlewares */
app.use(tracker);

/* Load routes */
app.use('/landing/', landing);
app.use('/api/', api);
app.use('/prov/', prov);

/*
 * Error handlers
 * --------------------
 * Development error handler - will print stacktrace
 */
if (app.get('env') === 'development') {
		app.use(function(err, req, res, next) {
						res.status(err.status || 500);
						res.render('error', {
								message: err.message,
								error: err
								});
						});
}
else {
	/*
	 * Production error handler - no stacktraces leaked to user
	 */
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
}


app.listen (2178);
module.exports = app;
