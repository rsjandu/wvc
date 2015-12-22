var express         = require('express');
var path            = require('path');
var _class          = require('api-backend/controllers/class');
var log             = require('api-backend/common/log');
var router          = express.Router();

router.use (function (req, res, next) {
	var child_logger = log.child ({ req_id : req.req_id });
	req.log = child_logger;
	next ();
});

router.post ('/create', function(req, res, next) {
	return _class.create (req, res, next);
});

router.post ('/update/:class_id', function(req, res, next) {
	return _class.update (req, res, next);
});

router.post ('/remove/:class_id', function(req, res, next) {
	return _class.remove (req, res, next);
});

module.exports = router;

