var log             = require("../common/log");
var config          = require("../config");
var addr            = require("./addr");

var list_active = {};
var list_removed = {};
var users = {};

users.add_user = function (user, conn) {
	if (list_active[user])
		return false;

	list_active[user] = {};
	list_active[user].user = { name : user };
	list_active[user].conn = conn;

	return true;
};

users.remove_user = function (user) {
	if (!list_active[user])
		return false;

	list_removed[user] = {};
	list_removed[user].user = { name : user };

	delete list_active[user];

	log.info ('user \"' + user + '\" removed');

	return true;
};

users.broadcast_info = function (from, to, info_id, info, except) {
	var list = [];

	for (var u in list_active) {

		if (except)
			if (list_active[u].user.name == except)
				continue;

		var user = list_active[u];
		to = addr.prepend (to, 'user', user.user.name);
		user.conn.send_info (from, to, info_id, info);
	}
};

module.exports = users;
