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
		var cont = layout.get_container ('video-primary');

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
		f_handle_cached.notify.alert('AV Error (' + code + ') ' + title, message, 'danger', {
			non_dismissable : true,
			button : { }
		});
	}

	function sessionConnected (ev) {
		log.info ('TODO : sessionConnected:', ev);
	}
	function sessionDisconnected (ev) {

		f_handle_cached.notify.alert ('AV: Session Disconnected', ev.reason, 'danger', {
			non_dismissable : true,
			button : { }
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

		if (!conn_map[connection_id])
			conn_map[connection_id] = { streams : {} };

		if (!local_)
			local_ = false;

		conn_map[connection_id].local = local_;

		if (conn_map[connection_id].pending) {

			/* 
			 * See description of the race condition below in "streamCreated"
			 */

			for (var stream_id in conn_map[connection_id].pending) {
				var stream = conn_map[connection_id].pending[stream_id];

				/* Delayed call to streamCreated */
				streamCreated (stream_id, stream);
			}

			delete conn_map[connection_id].pending;
		}
	}

	function connectionDestroyed (connection_id, reason) {

		if (!conn_map[connection_id]) {
			log.error ('connectionDestroyed: no mapping for connection id ' + connection_id + ' (reason = ' + reason + ')');
			return;
		}

		log.info ('connection destroyed: ' + connection_id + ', reason = ' + reason);

		for (var stream_id in conn_map[connection_id].streams) {
			var stream = conn_map[connection_id].streams[stream_id];
			streamDestroyed (stream_id, stream);
		}

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

			if (!conn_map[connection_id].pending)
				conn_map[connection_id] = { pending : {} };

			conn_map[connection_id].pending[stream_id] = stream;

			/* We'll be called again once the connectionCreated is fired (unless tokbox has 
			 * some bug). */
			return;
		}

		/* 
		 * This is the normal path. Decide the type of container needed and get it.
		 *
		 */
		var local = conn_map[connection_id].local;
		var type;

		switch (stream.videoType) {
			case 'screen': 
				type = local ? 'screenshare-local' : 'screenshare-remote';
				break;

			case 'camera':
				type = local ? 'video-primary' : 'video-secondary';
				break;

			default:
				log.error ('Unknown stream type "' + stream.videoType + '", conn_id: ' + connection_id + ', stream_id: ' + stream_id);
				type = 'video-secondary';
				break;
		}

		var container = layout.get_container (type);
		if (!container) {
			/* We cannot show this video as we ran out of containers. Here
			 * we should switch to pure audio. TODO: implement this */
			f_handle_cached.notify.alert ('Internal TODO message', 'Ran out of containers ! Implement audio only containers.', 'danger',
										  {
											  non_dismissable: false,
											  button : {
												  cancel : function () {}
											  }
										  });
			return;
		}


		container.set_connection_id (connection_id);

		stream_map[stream_id] = {
			connection_id : connection_id,
		};

		conn_map[connection_id].streams[stream_id] = {
			stream : stream,
			container : container
		};

		tokbox.subscribe (stream, container.div(), opts_override)
			.then(
				function () {
					/* The video should automatically get shown in the container
					 * that we passed above */
					layout.reveal_video(container);
				},
				function (err) {
					layout.show_error (container, err);
				}
			);
	}

	function streamDestroyed (stream_id, reason) {

		if (!stream_map[stream_id])
			return;

		var connection_id = stream_map[stream_id].connection_id;
		var container = conn_map[connection_id].streams[stream_id].container;

		log.info ('stream destroyed: stream_id: ' + stream_id + ', reason = ' + reason);
		layout.giveup_container (container, reason);

		delete conn_map[connection_id].streams[stream_id];
		delete stream_map[stream_id];
	}

	return session;

});
