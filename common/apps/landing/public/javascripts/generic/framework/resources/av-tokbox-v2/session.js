define(function(require) {
	var $           = require('jquery');
	var log         = require('log')('av-session', 'info');
	var local       = require('./local-media');
	var layout      = require('./layout');
	var tokbox      = require('./tokbox');

	var session = {};
	var sess_info_cached;
	var f_handle_cached;
	var handlers = {
		/* Session related */
		'sessionConnected'       : sessionConnected,
		'sessionDisconnected'    : sessionDisconnected,
		'sessionReconnecting'    : sessionReconnecting,
		'sessionReconnected'     : sessionReconnected,

		/* Connection related */
		'connectionCreated'      : connectionCreated,
		'connectionDestroyed'    : connectionDestroyed,
		'streamCreated'          : streamCreated,
		'streamDestroyed'        : streamDestroyed
	};

	session.init = function (display_spec, custom, perms) {
		tokbox.set_exception_handler (exception_handler);
		return null;
	};

	session.start = function (f_handle, sess_info) {
		var d = $.Deferred ();

		sess_info_cached = sess_info;
		f_handle_cached  = f_handle;

		/* Get a div for the local media. For now, let's get a primary div. Once 
		 * the permissions set in, this will depend on the role of the current
		 * user */
		var cont = layout.get_container ('primary');

		tokbox.init (sess_info)
			.then ( tokbox.set_handlers.bind(tokbox, handlers),    d.reject.bind(d) )
			.then ( tokbox.connect,                                d.reject.bind(d) )
			.then ( local.init.bind(null, f_handle, cont),         d.reject.bind(d) )
			.then ( local.start,                                   d.reject.bind(d) )
			;

		return d.promise();
	};

	session.info = function (from, id, data) {
		log.info ('TODO : session.info called but not implemented');
	};

	var conn_map = {};
	var stream_map = {};

	function exception_handler (code, title, message) {
		f_handle_cached.notify.alert ('AV Error (' + code + '): ' + title + ' - ' + message, {
			level : 'danger',
			dismissable : 'true'
		});
	}

	function sessionConnected (ev) {
		log.info ('TODO : sessionConnected:', ev);
	}
	function sessionDisconnected (ev) {
		f_handle_cached.notify.alert ('AV: Session Disconnected. Reason: ' + ev.reason, {
			level : 'danger',
			dismissable : 'true'
		});
	}
	function sessionReconnecting (ev) {
		log.info ('TODO : sessionReconnected', ev);
	}
	function sessionReconnected (ev) {
		log.info ('TODO : sessionConnected', ev);
	}

	function connectionCreated (connection_id, local_) {

		var container;

		/* If this event has been raised for our local media 
		 * then ignore, since we've already done work for it
		 * in the 'start' method */
		if (!local_)
			container = layout.get_container ('secondary');
		else
			container = local.container();

		if (!container) {
			/* We cannot show this video as we ran out of containers. Here
			 * we should switch to pure audio. TODO: implement this */
			f_handle_cached.notify.alert ('TODO: Ran out of video containers - implement audio only containers');
			return;
		}

		container.set_connection_id (connection_id);

		if (conn_map[connection_id]) {
			/* See description of the race condition below in "streamCreated" */
			conn_map[connection_id].container = container;
			streamCreated (
				conn_map[connection_id].pending.stream_id,
				conn_map[connection_id].pending.stream
			);
			delete conn_map[connection_id].pending;
		}
		else {
			conn_map[connection_id] = {
				container : container,
			};
		}
	}
	function connectionDestroyed (connection_id, reason) {
		var container = conn_map[connection_id].container;

		log.info ('connection destroyed: ' + connection_id + ', reason = ' + reason);
		layout.giveup_container (container, reason);
		delete conn_map[connection_id];
	}

	function streamCreated (stream_id, stream) {
		/*
		 * A new remote stream has been created */
		var opts_override = {};
		var connection_id = stream.connection.connectionId;

		/* Handle the race condition where the streamCreated may be called
		 * before the connectionCreated callback */
		if (!conn_map[connection_id]) {
			log.info ('race-condition: "streamCreated" called before "connectionCreated". Handling it.');
			conn_map[connection_id] = {
				pending : {
					stream_id : stream_id,
					stream    : stream
				}
			};

			/* We'll be called again once the connectionCreated is fired */
			return;
		}

		var container = conn_map[connection_id].container;

		layout.stream_created (container, stream);

		stream_map[stream_id] = {
			container : container,
			connection_id : connection_id,
			stream : stream
		};

		conn_map[connection_id].stream = stream;

		tokbox.subscribe (stream, container.div(), opts_override)
			.then(
				function () {
				},
				function (err) {
					layout.show_error (container, err);
				}
			);
	}

	function streamDestroyed (stream_id, reason) {
		var container = stream_map[stream_id].container;

		layout.stream_destroyed (container, reason);
	}

	return session;

});
