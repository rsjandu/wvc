var $ = require('jquery-deferred');

var av_tokbox = {};
var log;

av_tokbox.init = function (myinfo, common, handles) {
	var _d = $.Deferred ();

	log = handles.log;

	log.info ('av-tokbox: init :', myinfo);

	return _d.promise ();
};

av_tokbox.notify = function (what, data) {
	var _d = $.Deferred ();

	switch (what) {
		case 'auth':
			log.info ('av-tokbox: got informed: new user: ' + data.ep.i + ' (sender: ' + data.res + ')');
			/*
			 * Do your thing .. */

			_d.resolve (data);
			break;

		default:
			log.error ('unknown notification \"' + what + '\", data : ' + JSON.stringify(data, null, 2));
			return;
	}

	return _d.promise ();
};

av_tokbox.session_info = function () {
	return 'hello';
};

module.exports = av_tokbox;
