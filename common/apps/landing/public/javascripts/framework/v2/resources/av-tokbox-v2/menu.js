define(function (require) {
	var $            = require('jquery');
	var log          = require('log')('av-menu', 'info');

	var menu = {};
	var f_handle_cached;
	var custom_config_cached;

	menu.init = function (f_handle, custom) {
		f_handle_cached = f_handle;
		custom_config_cached = custom;

		$('.av-menu-item').on('click', menu.av_controls.fire);

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

	var av_controls_handler = null;
	var cam_state = 'unmute';

	menu.local_media_changed = function (the_thing, _new) {
		var target = the_thing === 'camera' ? 'video' : 'audio';
		var action = _new ? 'unmute' : 'mute';
		var inverse_action = (!_new) ? 'unmute' : 'mute';

		$('#av-menu-' + target + '-' + action).removeClass('disabled');
		$('#av-menu-' + target + '-' + action).css('display', 'none');
		$('#av-menu-' + target + '-' + inverse_action).css('display', 'inline-block');
	};

	menu.av_controls = {
		set_handler : function (handler) {

			if (av_controls_handler)
				throw 'menu.av_controls : duplicate handler registered';

			av_controls_handler = handler;
			$('.av-menu-item').removeClass('disabled');
		},

		fire : function (ev) {
			curr_target = $(ev.currentTarget).attr('id');

			if (!av_controls_handler)
				return;

			if ($(ev.currentTarget).hasClass('disabled'))
				return;
			/*
			 * The ids of the menu items are of the following syntax:
			 *     #av-menu-(audio|video)-(mute|unmute)
			 */
			var target = curr_target.replace(/^av-menu-([^-]+)-.*$/g, "$1");
			var action = curr_target.replace(/^.*-([^-]*mute)$/g, "$1");
			var inverse_action = (action === 'mute' ? 'unmute' : 'mute');

			av_controls_handler (target, action);

			/*
			 * The menu icon's display to mute/unmute is done in "menu.local_media_changed"
			 * which gets triggered on streamPropertyChanged. Disable it for now.
			 */

			$('#av-menu-' + target + '-' + action).addClass('disabled');

			return;
		},
	};

	return menu;

});
