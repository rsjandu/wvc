define(function(require) {
	var $ = require('jquery');
	$.whenall = function(arr) { return $.when.apply($, arr); };

	var core = {};
	var modules = [];

	core.load_modules = function (sess_config) {
				var resources = sess_config.resources;
				var _d = $.Deferred();
				var _d_arr = [];

				for (var i = 0; i < resources.length; i++) {
						_d_arr.push(__load (resources[i], ((resources.length - i) == 1)));
				}

				$.whenall(_d_arr).then(function() { _d.resolve('All Loading Done'); });

				return _d.promise();
	};

	function __load (resource, is_last, _d_success, _d_failure) {
			var _d = $.Deferred();

			require([ resource.name ],
					function (arg) {
							console.log ('loaded module', arg);
							var module = {
															name: resource.name,
															handle: arg
							};

							modules.push(module);
							_d.resolve();
					},
					function (err) {
							console.log ('ERROR !loaded module', err);
							_d.resolve();
					}
			);

			return _d.promise();
	}

	core.init_modules = function () {
		console.log ('init_modules');
	};

	return core;
});
