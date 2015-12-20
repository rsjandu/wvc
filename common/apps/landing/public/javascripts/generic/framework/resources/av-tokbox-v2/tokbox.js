define(
	[ 
		'require', 
		'//static.opentok.com/v2/js/opentok.min.js', 
		'log', 
		'jquery' 
	], 
function (require, ot, _log, $) {

	var log         = _log('av-tokbox', 'info');
	var OT          = window.OT;

	var tokbox = {};
	var sess_obj;
	var publisher;

	OT.on ('exception', handle_exceptions);

	tokbox.init = function (sess_info) {
		var d = $.Deferred ();

		if ( OT.checkSystemRequirements() === 0 ) {
			d.reject ('OT: no WebRTC support. Aborting.');
			return d.promise();
		}

		sess_obj = OT.initSession(sess_info.key, sess_info.sessionid);
		sess_obj.off ();

		d.resolve (sess_info);

		return d.promise();
	};

	tokbox.set_handlers = function (handlers, sess_info) {
		var d = $.Deferred ();

		sess_obj.on ({

			/*
			 * Session related hanclers
			 */
			sessionConnected    : handlers.sessionConnected,
			sessionDisconnected : handlers.sessionDisconnected,
			sessionReconnecting : handlers.sessionReconnecting,
			sessionReconnected  : handlers.sessionReconnected,

			/*
			 * Connection related hanclers
			 */

			connectionCreated : function (ev) {
				var connection = ev.connection;
				var id = connection.connectionId;

				add_to_list (id, connection);
				var local = (id == sess_obj.connection.connectionId) ? true : false;
				log.info ('connection created: ' + id + ' (local = ' + local + '), data: ' + connection.data);

				handlers.connectionCreated (id, local);
			},

			connectionDestroyed : function (ev) {
				var connection = ev.connection;
				var id = connection.connectionId;

				log.info ('connection destroyed: ' + id + ', reason: ' + ev.reason);
				remove_from_list (id);
				handlers.connectionDestroyed (id, ev.reason);
			},

			/*
			 * Stream related hanclers
			 */

			streamCreated : function (ev) {
				var stream = ev.stream;
				var id = stream.streamId;

				log.info ('stream created: ' + id + ', stream: ', stream);
				handlers.streamCreated (id, stream);
			},

			streamDestroyed : function (ev) {
				var stream = ev.stream;
				var id = stream.streamId;

				log.info ('stream destroyed: ' + id + ', reason: ' + ev.reason);
				handlers.streamDestroyed (id, ev.reason);
			},

			streamPropertyChanged : function (ev) {
				var property = ev.changedProperty;
				var _old = ev.oldValue;
				var _new = ev.newValue;
				var id = ev.stream.streamId;

				log.error ('stream property changed: ' + id + ', property: ' + property + ', changed from (' + _old + ') --> (' + _new + ')');
				handlers.streamPropertyChanged (id, property, _old, _new);
			},

		});

		d.resolve (sess_info);

		return d.promise();
	};

	tokbox.connect = function (sess_info) {
		var token = sess_info.token;
		var d = $.Deferred ();

		sess_obj.connect (token, function (err) {
			if (err)
				return d.reject (err);

			d.resolve(sess_info);
		});

		return d.promise();
	};

	tokbox.init_publisher = function (i_am, sess_info, div, opts) {
		var d = $.Deferred ();

		if (!div)
			log.error ('no div supplied !');

		var options = {
			width : '100%',
			height : '100%',
			audioFallbackEnabled : true,
			fitMode : 'contain',
			frameRate : 30,
			insertMode : 'append',
			maxResolution : { width : 1280, height : 720 },
			name : i_am,
			publishAudio : true,
			publishVideo : true,
			resolution : opts && opts.resolution || "640x480",
			showControls : false,
			style : {
				audioLevelDisplayMode : 'off',
				backgroundImageURI : 'off',
				nameDisplayMode : 'off',
				buttonDisplayMode: 'off'
			}
		};

		publisher = OT.initPublisher (div, opts, function (err) {
			if (err)
				return d.reject (err);

			return d.resolve (sess_info);
		});

		/* Remove any styling introduced by the tokbox api.All our
		* styling will be done via our code/CSS. */
		$(div).attr('style', '');

		return d.promise();
	};

	tokbox.publish = function () {
		var d = $.Deferred ();

		sess_obj.publish (publisher, function (err) {
		});

		return d.promise();
	};

	var upstream_exception_h;
	tokbox.set_exception_handler = function (handler) {
		upstream_exception_h = handler;
	};

	tokbox.set_pub_handlers = function (handlers) {
		for (var ev in handlers) {
			publisher.on(ev, handlers[ev]);
		}
	};

	tokbox.subscribe = function (stream, div, opts_override) {
		var d = $.Deferred ();

		if (!div)
			log.error ('no div supplied !');

		var options = {
			style : {
				nameDisplayMode : 'off',
				buttonDisplayMode: 'off',
				videoDisabledDisplayMode: 'auto',
				audioLevelDisplayMode: 'off'
			},
			fitmode : 'contain',
			insertMode : 'append',
			width : '100%',
			height : '100%',
		};

		var subscriber = sess_obj.subscribe (stream, div, options, function (err) {
			if (err)
				return d.reject (err);

			subscriber.on('audioLevelUpdated', function (ev) {
			});
		});

		return d.promise ();
	};

	var exceptions = {
		'1004' : 'Authentication error',
		'1005' : 'Invalid Session ID',
		'1006' : 'Connect Failed',
		'1007' : 'Connect Rejected',
		'1008' : 'Connect Time-out',
		'1009' : 'Security Error',
		'1010' : 'Not Connected',
		'1011' : 'Invalid Parameter',
		'1013' : 'Connection Failed',
		'1014' : 'API Response Failure',
		'1026' : 'Terms of Service Violation: Export Compliance',
		'1500' : 'Unable to Publish',
		'1520' : 'Unable to Force Disconnect',
		'1530' : 'Unable to Force Unpublish',
		'1535' : 'Force Unpublish on Invalid Stream',
		'2000' : 'Internal Error',
		'2010' : 'Report Issue Failure',
	};

	function handle_exceptions (ev) {
		if (!upstream_exception_h)
			return log.error ('exception: (' + ev.code + ')' + ev.title + ': ' + ev.message);

		upstream_exception_h (ev.code, ev.title, ev.message);
	}

	var list = {};
	function add_to_list (id, conn_obj) {
		list[id] = conn_obj;
	}

	function remove_from_list (id) {
		delete list[id];
	}

	return tokbox;

});
