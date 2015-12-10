var express   = require('express');
var path      = require('path');
var log       = require('landing/common/log');
var session   = require('landing/controllers/session-v1');
var browser   = require('landing/lib/browser');
var router    = express.Router();

router.use(browser.check_compatibility);

router.get ('/:session_id/', function(req, res, next) {
	return session.load_page (req, res, next);
});

router.get('/:session_id/load', function(req, res, next) {
	return session.load_config (req, res, next);
});

module.exports = router;

