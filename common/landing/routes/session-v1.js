var express   = require('express');
var path      = require('path');
var config    = require('../config');
var log       = require('../common/log');
var session   = require('../controllers/session-v1');
var router    = express.Router();

router.get ('/:session_id/', function(req, res, next) {
	return session.load_page (req, res, next);
});

router.get('/:session_id/load', function(req, res, next) {
	return session.load_config (req, res, next);
});

module.exports = router;

