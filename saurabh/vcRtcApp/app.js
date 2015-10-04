/* Following skeleton generated
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var io = require('socket.io');

var routes = require('./routes/index');
var users = require('./routes/users');

var rooms = require('./routes/rooms');
var conf = require('./conf/config.js');
var vcUtils = require('./lib/vc-utils.js');
var vcRtc = require('./lib/vc-rtcapp.js');
var roomResource = require('./resource/roomManager');


var app = express();

/* view engine setup
 *
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/* uncomment after placing your favicon in /public
 * app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/rooms', rooms);

/* catch 404 and forward to error handler
 */
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* error handlers
 */

/* development error handler.
 *  will print stacktrace
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

/* production error handler
 * no stacktraces leaked to user
 */
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/* Start express web server.
 * Start socket.io server
 */

var server = http.createServer(app);
var socketServer = io(server);
var port = vcUtils.normalizePort(conf.http.port);
server.listen(port, function() {
  console.log('listening on *:' + port);
});

var rtc = vcRtc.start(app, socketServer);

module.exports = app;
