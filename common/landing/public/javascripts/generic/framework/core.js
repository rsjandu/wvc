define(function(require) {
	var dom         = require('dom_ready');
	var $           = require('jquery');
	var framework   = require('framework');
	var cc          = require('cc');
	var sess_config = require('session-config');
	var log         = require('log')('core', 'info');

	$.whenall = function(arr) { return $.when.apply($, arr); };

	var core = {};
	var modules = [];
	var __sess_config = {};

	core.init = function () {
		var _d = $.Deferred ();

		/*
		 * STAGE I (initialize based on class configuration) */

		sess_config.get()
			.then ( cache_config,                   _d.reject.bind(_d) )
			.then ( framework.init,                 _d.reject.bind(_d) )
			.then ( load_modules,                   _d.reject.bind(_d) )
			.then ( domready,                       _d.reject.bind(_d) )
			.then ( init_modules,                   _d.reject.bind(_d) )
			.then ( mark_complete.bind('STAGE I'),  _d.reject.bind(_d) )

		/*
		 * STAGE II (initialize based on session info) */

			.then ( cc.init.bind(null, framework),  _d.reject.bind(_d) )
			.then ( auth,                           _d.reject.bind(_d) )
			.then ( framework.post_init,            _d.reject.bind(_d) )
			.then ( framework.wait_for_start,       _d.reject.bind(_d) )
			.then ( mark_complete.bind('STAGE II'), _d.reject.bind(_d) )

		/*
		 * STAGE III (start the modules) */

			.then ( start_modules,                   _d.reject.bind(_d) )
			.then ( mark_complete.bind('STAGE III'), _d.reject.bind(_d) )
			.then (_d.resolve.bind(_d),              _d.reject.bind(_d) )
			;

		return _d.promise();
	};

	function cache_config (_s) {
		var _d = $.Deferred();
		__sess_config = _s;
		_d.resolve (_s);
		return _d.promise();
	}

	function load_modules (_s) {
		var resources = _s.resources;
		var _d = $.Deferred();
		var _d_arr = [];

		for (var i = 0; i < resources.length; i++) {
			_d_arr.push(__load (resources[i]));
		}

		$.whenall(_d_arr).then(function() { _d.resolve(_s); });

		return _d.promise();
	}

	function domready (_s) {
		var _d = $.Deferred();

		dom(function () {
			_d.resolve (_s);
		});

		return _d.promise();
	}

	function init_modules (_s) {
		var resources = _s.resources;
		var _d = $.Deferred();
		var count = 0;

		function ok () {
			count--;
			if (!count)
				_d.resolve(_s);
		}

		/*
		 * Even if a few modules fail to initialize, keep going. */

		for (var i = 0; i < modules.length; i++) {
			count++;
			var d = __init (modules[i]);
			d.then (ok.bind(d), ok.bind(d));
		}

		return _d.promise ();
	}

	function start_modules (_s) {
		var resources = _s.resources;
		var _d = $.Deferred();

		for (var i = 0; i < modules.length; i++) {
			framework.start_module (_s, modules[i]);
		}

		_d.resolve (_s);
		return _d.promise ();
	}

	/*----------------------------------------------------------------
	 * Internals
	 *----------------------------------------------------------------*/

	function auth (sess_config) {
		var _d = $.Deferred ();

		cc.auth(sess_config)
			.then (
				function (status) {
					log.info ('auth return with ', status);
					_d.resolve (sess_config);
				},
				function (err) {
					_d.reject (err);
				}
			);

		return _d.promise();
	}

	function __load (resource) {
		var _d = $.Deferred();

		/*
		 * Push into 'modules' only those which have been succesfully loaded
		 */
		require([ 'resources/' + resource.name + '/main' ],
			function (arg) {
				var module = {
						name: resource.name,
						handle: arg,
						resource: resource
				};

				modules.push(module);
				_d.resolve();
			},
			function (err) {
				log.error ('load module err for ' + resource.name + ' :reason ' + err);
				_d.resolve();
			}
		);

		return _d.promise();
	}

	function __init (module) {
		return framework.init_modules (module);
	}

	function mark_complete (arg) {
		var _d = $.Deferred();
		log.log (this + ' ok');
		_d.resolve (arg);
		return _d.promise();
	}


	return core;
});
