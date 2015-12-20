define(function(require) {
	var $            = require('jquery');
	var log          = require('log')('av-local', 'info');
	var layout       = require('./layout');
	var tokbox       = require('./tokbox');
	var av_container = require('./container');

	var local = {};
	var publisher;
	var my_container;

	local.init = function (f_handle, container, sess_info) {
		var d    = $.Deferred ();
		var i_am = f_handle.identity.display_name;
		var div  = container.div();

		my_container = container;

		tokbox.init_publisher (i_am, sess_info, div)
			.then (set_pub_handlers.bind(d, sess_info), d.reject.bind(d));

		return d.promise();
	};

	local.start = function (sess_info) {
		var d    = $.Deferred ();

		tokbox.publish ()
			.then (d.resolve.bind(d, sess_info), d.reject.bind(d));

		return d.promise();
	};

	local.container = function () {
		return my_container;
	};

	function set_pub_handlers (sess_info) {
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

		this.resolve(sess_info);
	}

	/*
	 * ___________ Handlers ____________
	 *
	 */

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
		layout.stream_created (my_container, stream);
	}
	function streamDestroyed (ev) {
		layout.stream_destroyed (my_container, ev.reason);
	}

	return local;

});
