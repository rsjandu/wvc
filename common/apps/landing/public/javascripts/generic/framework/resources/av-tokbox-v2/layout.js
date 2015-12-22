define(function(require) {
	var $            = require('jquery');
	var events       = require('events');
	var log          = require('log')('av-layout', 'info');
	var av_container = require('./container');
	var cpool        = require('./container-pool');

	var layout = {};
	var sess_info_cached;
	var anchor;
	var pool_free = {}, pool_used = {};
	var current_layout = 'av-default';

	layout.init = function (f_handle, display_spec, custom, perms) {

		var templ_name = 'av-tokbox';
		var template = f_handle.template(templ_name);

		anchor = display_spec.anchor;

		if (!template)
			return 'av-layout: template "' + templ_name + '" not found';

		$(anchor).append( template() );
		set_handlers ();

		return null;
	};

	layout.get_container = function (type) {
		/*
		 * Type should be : 'video-primary', 'video-secondary', 'screenshare-local', 'screenshare-remote */
		var mode = display_mode (current_layout, type);
		return cpool.alloc_container (type, mode);
	};

	layout.giveup_container = function (container, reason) {
		return cpool.giveup_container (container);
	};

	layout.show_error = function (container, error) {
		return container.show_error (error);
	};

	layout.stream_destroyed = function (container, reason) {
		container.stream_destroyed (reason);
	};

	layout.reveal_video = function (container) {
		container.reveal_video ();
	};


	/*
	 * _______Container Pool Management___________
	 *
	 */
	function probe_layout (anchor, pool) {

		$.each( $('#av-containers .av-container'), function (index, div) {
			var id = $(div).attr('id');
			pool[id] = new av_container(div);
			log.info ('probe_layout: adding container "#' + id + '" to av pool');
		});
	}

	function set_handlers () {

		events.bind('framework:layout', layout_changed, 'av-layout');

		$('.av-container').on('click', function (ev) {
			var clicked_div = ev.currentTarget;

			var div_id = $(clicked_div).attr('id');
			var clicked_container = cpool.get_container_by_id ('used', div_id);

			if (current_layout === 'av-default' || current_layout === 'av-fullscreen') {
				/* 
				 * Video Container's click handler - makes the clicked
				 * video primary and turns the earstwhile primary into 
				 * a secondary video. Do nothing for screenshare in av-default.
				 */
				if (clicked_container && clicked_container.in_mode('screenshare'))
					return;

				var primary = cpool.get_primary_mode_container ();

				if (primary)
					primary.set_mode ('secondary');

				if (clicked_container)
					clicked_container.set_mode ('primary');
			}
		});
	}

	function display_mode (_layout, type) {
		var mode;

		/* 
		 * Return the display mode depending upon the layout
		 */

		switch (_layout) {
			case 'av-fullscreen':
				mode = {
					'video-primary'      : 'primary',
					'video-secondary'    : 'secondary',
					'screenshare-local'  : 'secondary',
					'screenshare-remote' : 'secondary',
				};
				break;

			case 'av-tiled':
				mode = {
					'video-primary'      : 'secondary',
					'video-secondary'    : 'secondary',
					'screenshare-local'  : 'secondary',
					'screenshare-remote' : 'secondary',
				};
				break;

			case 'av-default':
				mode = {
					'video-primary'      : 'primary',
					'video-secondary'    : 'secondary',
					'screenshare-local'  : 'secondary',
					'screenshare-remote' : 'screenshare',
				};
				break;

			default:
				mode = {
					'video-primary'      : 'primary',
					'video-secondary'    : 'secondary',
					'screenshare-local'  : 'secondary',
					'screenshare-remote' : 'screenshare',
				};
				break;
		}

		return mode[type];
	}

	function layout_changed (ev, data) {
		var new_layout = ev;

		cpool.get_used_list ().forEach(function (container, index, arr) {
			var curr_mode = container.get_mode();
			var type      = container.get_type();
			var new_mode  = display_mode (new_layout, type);

			if (new_mode != curr_mode)
				container.set_mode (new_mode);
		});

		current_layout = new_layout;
		return;
	}

	return layout;

});
