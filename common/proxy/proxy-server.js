



var express = require('express');
var bodyParser = require('body-parser');
var log = require('./log');
var proxy_api = require('./proxy-api');
var app = express();
var router = express.Router();
router.post ('/addRoute', proxy_api.register);
router.post ('/deleteRoute', proxy_api.unregister);
router.get ('/listRoutes/:host_id', proxy_api.listall);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router);

var host = require('./args');
var ext_port = 443;

log.info ({
	host : host,
	port : ext_port
}, 'Starting proxy');

app.listen(3141);
