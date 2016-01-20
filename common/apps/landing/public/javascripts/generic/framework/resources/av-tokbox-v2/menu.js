define(function (require) {
	var $            = require('jquery');
	var log          = require('log')('av-menu', 'info');

	var menu = {};
	var f_handle_cached;
	var custom_config_cached;

	menu.init = function (f_handle, custom) {
		f_handle_cached = f_handle;
		custom_config_cached = custom;

		return null;
	};

	var screenshare_handler = null;
	var screenshare_enabled = false;

	menu.screenshare = {
		set_handler : function (handler) {
				screenshare_handler = handler;
				screenshare_enabled = true;
				$('#widget-nav li#nav-screenshare a').on('click', handler);
				$('#widget-nav li#nav-screenshare').removeClass('disabled');
			},

		enable : function () {
				if (screenshare_handler) {
					if (screenshare_enabled)
						return;

					$('#widget-nav li#nav-screenshare a').on('click', screenshare_handler);
					$('#widget-nav li#nav-screenshare').removeClass('disabled');
				}
			},

		disable : function () {
				screenshare_enabled = false;
				$('#widget-nav li#nav-screenshare a').off('click');
				$('#widget-nav li#nav-screenshare').addClass('disabled');
			},
	};

	return menu;

});
