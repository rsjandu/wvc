define(function(require) {
	var $           = require('jquery');
	var jmenu       = require('jquery_mmenu');
	window.jade     = require('jade');
	var log         = require('log')('cube', 'info');
	var framework   = require('framework');

	var cube = {};
	var f_handle = framework.handle ('cube');

	cube.init = function (display_spec, custom, perms) {
		var _d = $.Deferred();
		var anchor = display_spec.anchor;
		var template = f_handle.template('cube');

		if (!template) {
			_d.reject ('template \"cube\" not found');
			return _d.promise ();
		}

		$('body').append(template());

		_d.resolve();
		return _d.promise();
	};

	cube.start = function (sess_info) {
	};

	cube.info = function (from, id, data) {
	};

	return cube;
});
