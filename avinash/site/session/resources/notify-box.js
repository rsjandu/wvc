var log             = require("../../common/log");
var config          = require("../../config");

var notify = {};

notify.init = function (myinfo, common, handles) {
	log = handles.log;

	log.info ('notify: init ok');
};

module.exports = notify;
