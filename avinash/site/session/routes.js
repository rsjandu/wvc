var express = require('express');
var router = express.Router();

var app = express();

app.use ('/', function (req, res, next) {
			/* TODO */
			next();
});

app.get('/v1/assets/*', function(req, res, next) {
		var path = req.params[0];

		if (path.indexOf('..') === -1) {
				return res.sendfile(__dirname + '/assets/' + path);
		} else {
				res.status = 404;
				return res.send('Not Found');
		}
});

app.get('/v1/join', function(req, res, next) {
		res.render('./views/join.v1');
});

module.exports = app;
