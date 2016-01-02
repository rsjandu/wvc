var log             = require("./common/log");

cipher = {};

cipher.decode = function (type, msg) {
	/* For now the mesage is just URL encoded */
	return decodeURIComponent (msg);
};

module.exports = cipher;
