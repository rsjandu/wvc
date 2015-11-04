define(function(require) {
	var $         = require('jquery');
	var av        = require('widget-av');
	var nav       = require('widget-nav');
	var notify    = require('widget-notify');
	var tabs      = require('widget-tabs');
	var log       = require('log')('layout-ctrl', 'info');

	var lc            = {};
	var layout        = {};
	var _framework;

	lc.init = function (sess_config, f_handle) {
		_framework = f_handle.handle('layout-ctrl');
	};

	lc.probe_layout = function () {

		if ($('#widget-nav').length !== 0)
			layout.nav = $('#widget-nav')[0];

		if ($('#widget-notify').length !== 0)
			layout.notify = $('#widget-notify')[0];

		if ($('#widget-av').length !== 0)
			layout.av = $('#widget-av')[0];

		if ($('#widget-chat').length !== 0)
			layout.chat = $('#widget-chat')[0];

		if ($('#widget-tabs').length !== 0)
			layout.tabs = $('#widget-tabs')[0];

		if ($('#widget-side-left').length !== 0)
			layout.side_left = $('#widget-side-left')[0];

		if ($('#widget-side-right').length !== 0)
			layout.side_right = $('#widget-side-right')[0];
	};

	lc.attach_module = function (_module) {
		var widget = _module.resource.display_spec.widget;
		var inner;

		switch (widget) {

			case 'none'   : return null;
			case 'av'     : return av.attach (layout.av, _module);
			case 'notify' : return notify.attach (layout.notify, _module);
			case 'tabs'   : return tabs.attach (layout.notify, _module);
			case 'nav'    : return nav.attach (layout.nav, _module);

			default : 
				log.error ('_module ' + _module.name + ' requesting non-existent widget ' + widget);
				return '_module ' + _module.name + ' requesting non-existent widget ' + widget;
		}

		return null;
	};

	lc.post_init = function () {

		/* Create menu for layout changes */
		var _m = _framework.menu;

		_m.add ('Layout', 'layout');
		_m.add ('Full Video', 'layout.av_full');
		_m.add ('Tiled Video(s)', 'layout.av_tiled');
		_m.add ('Default', 'layout.av_default');
		_m.handler (menu_handler);
	};

	function menu_handler (menu_uid) {

		switch (menu_uid) {
			case 'layout.av_full':
				$('body').addClass('av-fullscreen');
				break;

			case 'layout.av_tiled':
				$('body').removeClass('av-tiled');
				break;

			case 'layout.av_default':
				$('body').removeClass('av-tiled');
				$('body').removeClass('av-fullscreen');
				break;
		}
	}


	return lc;
});
