var events          = require('./events');
var log             = require("../common/log");
var config          = require("../config");

var list_active = {};
var users = {};

events.on ('connection:closed', function (user) {
	if (!list_active[user]) {
		log.error ('user: on connection:closed - no user = ' + user);
		return;
	}
	delete list_active[user];
	log.info ('user: on connection:closed - removed user: ' + user);
});

users.add_user = function (user, sock) {
	if (list_active[user])
		return false;

	list_active[user] = {};
	list_active[user].user = { name : user };
	list_active[user].sock = sock;

	return list_active[user];
};

users.all_but = function (user) {
	var list = [];

	for (var u in list_active) {

		if (list_active[u].user.name == user)
			continue;

		list.push (list_active[u]);
	}

	return list;
};

module.exports = users;
