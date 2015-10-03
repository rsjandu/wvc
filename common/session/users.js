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
	list_active[user].state = 'waiting';

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

users.mark_joined = function (user) {
	list_active[user].state = 'in-session';
};

users.all_waiting = function () {
	var arr = [];

	for (var u in list_active) {
		if (list_active[u].state === 'waiting')
			arr.push(list_active[u].user.name);
	}

	return arr;
};

users.send_info = function (user, from, to, info_id, info) {
	var _u = list_active[user];
	var conn = _u.conn;

	if (!joined(_u)) {
		log.warn ('users:send_info: \"' + info_id + '\" not sent to user.' + user + ' : reason - not active');
		return;
	}

	conn.send_info (from, addr.prepend(to, 'user', user), info_id, info);
};


users.broadcast_info = function (from, to, info_id, info, except) {
	var list = [];

	for (var u in list_active) {

		if (except)
			if (list_active[u].user.name == except)
				continue;

		if (!joined(list_active[u]))
			continue;

		var user = list_active[u];
		to = addr.prepend (to, 'user', user.user.name);
		user.conn.send_info (from, to, info_id, info);
	}
};

function joined (_user) {
	if (_user.state === 'in-session')
		return true;
	
	return false;
}

module.exports = users;
