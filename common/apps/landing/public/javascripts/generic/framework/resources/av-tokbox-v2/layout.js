define(function(require) {
	var $            = require('jquery');
	var log          = require('log')('av-layout', 'info');
	var av_container = require('./container');

	var layout = {};
	var sess_info_cached;
	var anchor;
	var pool_free = {}, pool_used = {};

	layout.init = function (f_handle, display_spec, custom, perms) {

		var templ_name = 'av-tokbox';
		var template = f_handle.template(templ_name);

		anchor = display_spec.anchor;

		if (!template)
			return 'av-layout: template "' + templ_name + '" not found';

		$(anchor).append( template() );
		probe_layout (anchor, pool_free);
		set_handlers ();

		return null;
	};

	layout.get_container = function (type) {
		/*
		 * Type should be : 'primary', 'secondary', 'screenshare' */
		return get_free_container (type);
	};

	layout.giveup_container = function (container, reason) {
		return giveup_container (container);
	};

	layout.show_error = function (container, error) {
		return container.show_error (error);
	};

	layout.stream_created = function (container, stream) {
		container.stream_created (stream);
	};

	layout.stream_destroyed = function (container, reason) {
		container.stream_destroyed (reason);
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
		var primary = null;

		$('.av-container').on('click', function (ev) {
			var container_div = ev.currentTarget;

			/* Get the current primary container */
			for (var c in pool_used) {
				var cont = pool_used[c];

				if (cont.is_primary ()) {
					primary = cont;
					break;
				}
			}

			var div_id = $(container_div).attr('id');
			var container = pool_used[div_id];

			if (primary)
				primary.set_type('secondary');

			if (container)
				container.set_type('primary');
		});
	}

	function get_free_container (type) {
		var c = Object.keys (pool_free);

		if (!c.length) {
			log.error ('no free containers left');
			return null;
		}

		/* Take the first available container */
		var container = pool_free[c[0]];

		container.set_type(type);
		container.change_state ('connected');

		pool_used[c[0]] = container;
		delete pool_free[c[0]];

		log.info ('allocated container #' + c[0] + ', type = ' + type);

		return container;
	}

	function giveup_container (container) {
		var id = container.id();

		if (!pool_used[id]) {
			log.error ('attempt to giveup non-used container (id = #' + id + ')');
			return;
		}

		var cont = pool_used[id];
		pool_free[id] = cont;
		delete pool_used[id];

		cont.giveup ();
	}

	return layout;

});
