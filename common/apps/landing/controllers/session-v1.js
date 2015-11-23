var path      = require('path');
var async     = require('async');
var backend   = require('landing/controllers/backend-if');
var provision = require('landing/controllers/provision-server');
var log       = require('landing/common/log');
var templates = require('landing/controllers/templates');

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
		var css = [];

		if (err)
			return next(err, req, res);

		var _templates = templates.load (__dirname + '/../views/framework/templates', sess_config);

		/*
		 * Get a list of all CSS files to be loaded */
		for (var r = 0; r < sess_config.resources.length; r++ ) {
			if (sess_config.resources[r].display_spec.css) {
				css.push ({
					resource: sess_config.resources[r].name,
					css:      sess_config.resources[r].display_spec.css
				});
			}
		}

		res.render ('framework/' + sess_config.structure + '/vc-frame', { 
			layout     : sess_config.layout,
			theme      : sess_config.theme,
			_templates : JSON.stringify(_templates),
			styles     : css
		});
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
