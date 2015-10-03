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
	var log = require('log')('init', 'info');

	/*
	 * Initialize the Core
	 */
	core.init (
		function () {
			log.info ('init ok');
		},
		function (err) {
			log.error ('fatal : ' + err);
		}
	);
});
