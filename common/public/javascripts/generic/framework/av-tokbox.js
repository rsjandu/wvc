define(function(require) {
	var $ = require('jquery');
	var log = require('log')('av-tokbox', 'info');
	var framework = require('framework');

	var tokbox = {};
	var f_handle = framework.handle ('av-tokbox');

	tokbox.init = function (display_spec, custom, perms) {
			var _d = $.Deferred();

			log.info ('av-tokbox init called');

			var anchor = display_spec.anchor;
			$(anchor).append(
				'<div>' +
					'<h1> AV TOKBOX </h1>' +
				'</div>'
			);

			_d.resolve();

			return _d.promise();
	};

	tokbox.start = function (sess_info) {
		log.info ('My Stuff = ', sess_info);
	};

	function send_audio_mute () {
		f_handle.send_command ('*', 'audio.mute', 'on')
			.then (
				function (data) {
					log.info ('send_audio_must: on: ok', data);
				},
				function (err) {
					log.error ('send_audio_must: on: err: ' + err);
				}
			);
	}
	
	log.info ('av-tokbox loaded');
	return tokbox;
});
