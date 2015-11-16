requirejs.config({
	baseUrl: '/javascripts/generic/framework/',
	paths: {
		/* the left side is the module ID,
		 * the right side is the path to
		 * the jQuery file, relative to baseUrl.
		 * Also, the path should NOT include
		 * the '.js' file extension. */
		jquery:        '/javascripts/ext/jquery-1.11.3.min',
		jquery_drag:   '/javascripts/ext/jquery.event.drag-2.2/jquery.event.drag-2.2',
		jquerypp:      '/javascripts/ext/jquerypp.custom',
		jade:          '/javascripts/ext/jade-runtime',
		modernizer:    '/javascripts/ext/modernizr.custom',
		jquery_mmenu:  '/javascripts/ext/jquery.mmenu.min.all',
		dom_ready:     '/javascripts/ext/domReady',
		bookblock:     '/javascripts/ext/jquery.bookblock',
	},
	'shim' : {
		'jquery_drag'     : [ 'jquery' ],
		'jquery_mmenu'    : [ 'jquery' ],
		'jquerypp'        : [ 'jquery', 'modernizer' ],
		'bookblock'       : [ 'jquerypp' ]
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
