define(function(require) {
	var $            = require('jquery');
	var log          = require('log')('av-container-pool', 'info');
	var av_container = require('./container');

	var pool = {};
	var anchor;
	var available = {}, used = {};

	pool.init = function (f_handle, display_spec, custom, perms) {
		anchor = display_spec.anchor;
		probe (anchor, available);
		return true;
	};

	pool.alloc_container = function (type, mode) {
		var c = Object.keys (available);

		if (!c.length) {
			log.error ('no free containers left');
			return null;
		}

		/* Take the first available container */
		var container = available[c[0]];

		container.set_type (type);
		container.set_mode (mode);
		container.change_state ('connected');

		used[c[0]] = container;
		delete available[c[0]];

		log.info ('allocated container #' + c[0] + ', type (' + type + '), mode (' + mode + ')');

		return container;
	};

	pool.giveup_container = function (container) {
		var id = container.id();

		if (!used[id]) {
			log.error ('attempt to giveup non-used container (id = #' + id + ')');
			return;
		}

		available[id] = container;
		delete used[id];

		container.giveup ();
	};

	pool.get_containers_by_mode = function (mode) {
		var arr = [];

		for (var c in used) {
			var container = used[c];

			if (container.get_mode () == mode)
				arr.push(container);
		}

		return arr;
	};

	pool.get_container_by_id = function (pool, id) {
		if (pool != 'used' && 'pool' !== 'available')
			throw 'pool.get_container_by_id: invalid argument (pool = ' + pool + ')';

		var p = (pool === 'used' ? used : available);
		return p[id];
	};

	pool.get_used_list = function () {
		var arr = [];
		for (var c in used)
			arr.push(used[c]);
		return arr;
	};

	function probe (anchor, pool) {

		$.each( $('#av-containers .av-container'), function (index, div) {
			var id = $(div).attr('id');
			pool[id] = new av_container(div);
			log.info ('probe_layout: adding container "#' + id + '" to av pool');
		});
	}

	return pool;
});
