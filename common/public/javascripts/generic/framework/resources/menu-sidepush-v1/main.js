define(function(require) {
	var $           = require('jquery');
	var jmenu       = require('jquery_mmenu');
	window.jade     = require('jade');
	var log         = require('log')('menu-sidepush-v1', 'info');
	var framework   = require('framework');

	var msp = {};
	var f_handle = framework.handle ('menu-sidepush-v1');

	msp.init = function (display_spec, custom, perms) {
		var _d = $.Deferred();
		var anchor = display_spec.anchor;
		var template = f_handle.template('demo');

		if (!template) {
			_d.reject ('template \"demo\" not found');
			return _d.promise ();
		}

		$(anchor).append(template());
		$(anchor).append('<span id="vc-menu" class="vc-menu-icon fa fa-bars"></span>');
		$('nav#menu-side').mmenu();

		/* Attach a click handler */
		var h = $('nav#menu-side').data('mmenu');
		$('span#vc-menu').on('click', function () {
			h.open();
		});

		_d.resolve();
		return _d.promise();
	};

	msp.start = function (sess_info) {
	};

	msp.info = function (from, id, data) {
	};

	return msp;
});
