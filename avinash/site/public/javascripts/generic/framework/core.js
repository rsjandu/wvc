define(function(require) {
	var $ = require('jquery');
	var framework = require('framework');
	var log = require('log')('core');

	$.whenall = function(arr) { return $.when.apply($, arr); };

	var core = {};
	var modules = [];

	core.load_modules = function (sess_config) {
				var resources = sess_config.resources;
				var _d = $.Deferred();
				var _d_arr = [];

				for (var i = 0; i < resources.length; i++) {
						_d_arr.push(__load (resources[i]));
				}

				$.whenall(_d_arr).then(function() { _d.resolve(sess_config); });

				return _d.promise();
	};

	core.init_modules = function (sess_config) {
				var resources = sess_config.resources;
				var _d = $.Deferred();
				var _d_arr = [];
				/*
				 * Steps:
				 * 	1. Validate params
				 * 	2. Validate permissions
				 * 	3. Create div based on "framework" params
				 * 	4. Call module specific init, passing it framework & permission_set
				 */

				for (var i = 0; i < modules.length; i++) {
						_d_arr.push(__init (modules[i]));
				}

				$.whenall(_d_arr).then(
					function() { log.info ('init_modules finished'); },
					function() { log.error ('init_modules - some modules failed to initialize'); }
				);

				return;
	};

	/*----------------------------------------------------------------
	 * Internals
	 *----------------------------------------------------------------*/

	function __load (resource) {
			var _d = $.Deferred();

			/*
			 * Push into 'modules' only those which have been succesfully loaded
			 */
			require([ resource.name ],
					function (arg) {
							log.info ('loaded module', resource.name);
							var module = {
									name: resource.name,
									handle: arg,
									resource: resource
							};

							modules.push(module);
							_d.resolve();
					},
					function (err) {
							log.error ('could not load module', resource.name, ':reason', err);
							_d.resolve();
					}
			);

			return _d.promise();
	}

	function __init (module) {
			return framework.init_modules (module);
	}

	return core;
});
