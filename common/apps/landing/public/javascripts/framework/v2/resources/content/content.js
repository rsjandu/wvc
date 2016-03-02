define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var log         = require('log')('content', 'info');
	var framework   = require('framework');
	var player      = require('./player');

	var content = {};
	var f_handle = framework.handle ('content');

	content.init = function (display_spec, custom, perms) {
		var _d = $.Deferred();

		if (!player.init (display_spec, custom, perms, f_handle)) {
			_d.reject ('content player init failed');
			return _d.promise ();
		}

		_d.resolve();
		return _d.promise();
	};

	content.start = function (sess_info) {
		return;
	};

	content.create = function () {
		var options = {};

		var handle = f_handle.tabs.create (options);

		/*
		 * Show the library and then open the specific content
		 * clicked by the user */

		player.start (handle)
			.then (
				function () {
				},
				function (err) {
					log.error ('player start error = ' + err);
				}
			);

		return;
	};

	return content;

});
