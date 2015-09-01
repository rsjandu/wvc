define(function(require) {
	var $ = require('jquery');

	var xhr_timeout = 20000;

	var xhr = {};

	xhr.get = function (url, context) {
		var callback_data = new Object();
		var _d = $.Deferred();

		callback_data.context   = context;

		$.ajax ({
			async: true,
			cache: false,
			type: 'GET',
			contentType: 'application/json',
			url: url,
			success: function (_data, textStatus, xhr) {

					callback_data.response_data = _data;
					_d.resolve(callback_data);
				},

			error: function (xhr, textStatus, error) {

					callback_data.error = error;
					callback_data.textStatus = textStatus;
					callback_data.xhr = xhr;
					_d.reject(callback_data);
				},

			timeout: xhr_timeout
		});

		return _d.promise();
	};

	return xhr;
});
