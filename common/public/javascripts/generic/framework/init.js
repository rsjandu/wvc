requirejs.config({
	baseUrl: '/javascripts/generic/framework/',
	paths: {
		/* the left side is the module ID,
		 * the right side is the path to
		 * the jQuery file, relative to baseUrl.
		 * Also, the path should NOT include
		 * the '.js' file extension. */
		jade: '/javascripts/ext/jade-runtime',
		jquery: '/javascripts/ext/jquery-1.11.3.min',
		jquery_drag: '/javascripts/ext/jquery.event.drag-2.2/jquery.event.drag-2.2'
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
