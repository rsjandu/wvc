requirejs.config({
	baseUrl: '/javascripts/generic/framework/',
	paths: {
		/* the left side is the module ID,
		 * the right side is the path to
		 * the jQuery file, relative to baseUrl.
		 * Also, the path should NOT include
		 * the '.js' file extension. */
		jquery: '/javascripts/ext/jquery-1.11.3.min'
	}
});

define(function(require) {
	var $    = require('jquery');
	var core = require('core');
	var sess_config = require('session-config');
	var framework = require('framework');
	var log = require('log')('init', 'info');

	/*
	 * Initialize the Core
	 */
	sess_config.get()
		.then(core.init, fail)
		.then(core.load_modules, fail)
		.then(core.init_modules, fail)
	;

	function fail (err) {
		log.error ('fatal : ' + err);
	}

});
