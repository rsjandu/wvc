var express   = require('express');
var config    = require('../config');
var log       = require('../common/log');
var router    = express.Router();

router.get('/:session_id/join', function(req, res, next) {

	log.warn ('TODO : auth - redirecting to session/load for now');
	/*
	 * Simply redirect for now
	 *
	 */
	var session_id = req.params.session_id;
	res.redirect('/session/v1/' + session_id);
});

module.exports = router;

