define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var log         = require('log')('content', 'info');
	var framework   = require('framework');
	var player      = require('./player');
	var library     = require('./library');
	var upload      = require('./upload');

	var content = {};
	var f_handle = framework.handle ('content');

	content.init = function (display_spec, custom, perms) {
		var _d = $.Deferred();

		if (!library.init (display_spec, custom, perms, f_handle)) {
			_d.reject ('content library init failed');
			return _d.promise ();
		}

		if (!upload.init (display_spec, custom, perms, f_handle)) {
			_d.reject ('content upload init failed');
			return _d.promise ();
		}

		if (!player.init (display_spec, custom, perms, f_handle)) {
			_d.reject ('content player init failed');
			return _d.promise ();
		}

		_d.resolve();
		return _d.promise();
	};

	content.info = function (from, info_id, info, _instance) {

		switch (info_id) {
			case 'new-content' :
				return handle_remote_new_content (info);

			default :
				log.error ('received unknown info_id (' + info_id + '). Ignoring.');
				return;
		}
	};

	content.start = function (sess_info) {
		return;
	};

	content.create = function () {
		var options = {};

		var handle = f_handle.tabs.create (options);

		return library.start (handle);
	};

	function handle_remote_new_content (info) {
		var options = {
			uuid : info.uuid
		};

		var handle = f_handle.tabs.get_by_uuid (info.uuid);
		if (!handle)
			handle = f_handle.tabs.create (options);

		/* reusing the options variable ... */
		options = {
			show_library_icon : false,
			mode : 'fullview'
		};

		player.start (handle.anchor, info.content_uri, options);
	}

	return content;

});
