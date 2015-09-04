define(function(require) {

	return function (m) {
		var notify = {};

		notify.module = m;

		notify.debug = function () {
			console.debug ('DEBUG-' + this.module + ' -', arguments);
		};
		notify.info = function () {
			console.info ('INFO-' + this.module + ' -', arguments);
		};
		notify.warn = function () {
			console.warn ('WARN-' + this.module + ' -', arguments);
		};
		notify.error = function () {
			console.error ('ERROR-' + this.module + ' -', arguments);
		};

		return notify;
	};
});
