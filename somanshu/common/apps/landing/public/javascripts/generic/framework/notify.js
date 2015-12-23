define(function(require) {
	var $         = require('jquery');
	var log       = require('log')('notify', 'info');

	var notify     = {};

	notify.alert = function (message, opts) {
		log.error ('NOT IMPLEMENTED ! Message = "' + message + '", opts = ', opts);
	};


	return notify;
});
