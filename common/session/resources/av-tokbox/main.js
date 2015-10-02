var $ = require('jquery-deferred');

var av_tokbox = {};
var log;

av_tokbox.init = function (myinfo, common, handles) {
	var _d = $.Deferred ();

	log = handles.log;

	log.info ('av-tokbox: init :', myinfo);

	return _d.promise ();
};

av_tokbox.init_user = function (user) {
	var _d = $.Deferred ();

	_d.resolve ({ 
		u : user,
		service : 'tokbox',
		login : 'randomloginscreen',
		room : 'random-room-name'
	});

	return _d.promise ();
};

av_tokbox.session_info = function () {
	return 'hello';
};

module.exports = av_tokbox;
