define(function(require) {
	var $            = require('jquery');
	var log          = require('log')('av-local', 'info');
	var layout       = require('./layout');
	var tokbox       = require('./tokbox');
	var av_container = require('./container');
	var menu         = require('./menu');

	var local = {};
	var publisher;
	var my_container;
	var conn_emitter_cached;

	local.init = function (f_handle, container, conn_emitter, sess_info) {
		var d    = $.Deferred ();
		var i_am = f_handle.identity.vc_id;
		var div  = container.div();

		my_container = container;
		conn_emitter_cached = conn_emitter;

		tokbox.init_publisher (i_am, sess_info, div)
			.then (
				function (__sess_info, _publisher) {
					publisher = _publisher;
					set_handlers(d, sess_info);
				},
				d.reject.bind(d)
			);

		return d.promise();
	};

	local.start = function (sess_info) {
		var d    = $.Deferred ();

		tokbox.publish ()
			.then (
				d.resolve.bind(d, sess_info),
				d.reject.bind(d)
			);

		return d.promise();
	};

	local.container = function () {
		return my_container;
	};

	function set_handlers (d, sess_info) {
		menu.av_controls.set_handler (menu_handler);

		tokbox.set_pub_handlers ({
			'accessAllowed'        : accessAllowed,
			'accessDenied'         : accessDenied,
			'accessDialogOpened'   : accessDialogOpened,
			'accessDialogClosed'   : accessDialogClosed,
			'destroyed'            : destroyed,
			'mediaStopped'         : mediaStopped,
			'streamCreated'        : streamCreated,
			'streamDestroyed'      : streamDestroyed,
		});

		d.resolve(sess_info);
	}

	/*
	 * ___________ Handlers ____________
	 *
	 */
	function menu_handler (element, action) {

		log.info ('menu_handler called, ' + element + ', ' + action);

		switch (element) {
			case 'audio':
				log.info ('audio ' + action + 'ing ...');
				publisher.publishAudio (action === 'mute' ? false : true);
				break;

			case 'video':
				log.info ('video ' + action + 'ing ...');
				publisher.publishVideo (action === 'mute' ? false : true);
				break;

			default:
				log.error ('invalid element type = ' + element);
		}
	}

	function accessAllowed (ev) {
		/* All is well - do nothing */
	}
	function accessDenied (ev) {
		log.error ('it seems, access to local media was denied by the user. TODO: Show a modal error here.');
	}
	function accessDialogOpened (ev) {
		/* All is well - do nothing */
	}
	function accessDialogClosed (ev) {
		/* All is well - do nothing */
	}
	function destroyed (ev) {
		log.info ('publisher element destroyed: reason: ' + ev.reason);
	}
	function mediaStopped (ev) {
		/* All is well - do nothing */
	}
	function streamCreated (ev) {
		var stream = ev.stream;
		layout.reveal_video (my_container);

		conn_emitter_cached.emit('incoming-media', {
			connection_id : null,
			stream_id     : stream.stream_id,
			stream        : stream
		});
	}
	function streamDestroyed (ev) {
		log.info ('streamDestroyed: ev = ', ev);
		layout.stream_destroyed (my_container, ev.reason);
	}

	return local;

});
