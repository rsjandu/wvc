define(function(require) {

	var error = {};

	error.show = function (err) {
		console.log ('error.show:' + err);
	};

	return error;
});
