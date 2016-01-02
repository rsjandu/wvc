var log             = require("./common/log");
var cipher          = require("./cipher");
var names           = require("./names");

auth = {};
auth.process = function (msg) {
	var auth_info = null;

	/* Decode the message */
	var payload = cipher.decode ('auth', msg);

	if (!payload) {
		log.warn ('auth: decode error');
		throw 'decode error';
	}

	try {
		auth_info = JSON.parse (payload);
	}
	catch (e) {
		log.warn ('auth: JSON Parse error: ' + e);
		throw 'decode error : ' + e.message;
	}

	/* Assign a unique ID and a nickname to the user */
	auth_info.vc_id = random_id ();
	auth_info.nickname = names ();

	return auth_info;
};

var seed = 1;
function random_id () {
	var str = '';
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 5; i++ )
	str += possible.charAt(Math.floor(Math.random() * possible.length));

	seed++;
	return str + seed;
}

module.exports = auth;
