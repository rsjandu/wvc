var path      = require('path');
var async     = require('async');
var config    = require('../config');
var backend   = require('./backend-if');
var provision = require('./provision-server');
var log       = require('../common/log');
var templates = require('../controllers/templates');

controller = {};
controller.load_page = function (req, res, next) {

	var session_id = req.params.session_id;

	/*---------------------------------------
	 *
	 * Things to do:
	 * 		- load the session configuration
	 * 		  from the core backend
	 *
	 * 		- load the templates
	 * 			+ render the page
	 *
	 * 		- connect to provision server
	 * 			+ get the session instance information
	 *
	 *--------------------------------------*/

	backend.get_config (session_id, function (err, sess_config) {
		if (err)
			return next(err, req, res);

		var _templates = templates.load (config.templates.dir, sess_config);
		res.render ('framework/' + sess_config.layout + '/vc-frame', { _templates : JSON.stringify(_templates) });
	});
};

controller.load_config = function (req, res, next) {
	var session_id = req.params.session_id;

	backend.get_config (session_id, function (err, sess_config) {
		if (err)
			return next(err, req, res);

		res.status(200).send(sess_config);
	});
};

module.exports = controller;
