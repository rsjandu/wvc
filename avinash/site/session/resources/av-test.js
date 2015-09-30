var av_test = {};
var log;

av_test.init = function (myinfo, common, handles) {
	log = handles.log;

	log.info ('av-test: init ok');
};

av_test.notify = function (what, data) {
	switch (what) {
		case 'auth':
			log.info ('av-test: got informed: new user: ' + data.ep.i + ' (sender: ' + data.res + ')');
			break;

		default:
			log.error ('unknown notification \"' + what + '\", data : ' + JSON.stringify(data, null, 2));
			return;
	}
};

module.exports = av_test;
