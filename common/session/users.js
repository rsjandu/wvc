var log             = require("./common/log");
var config          = require("./config");
var addr            = require("./addr");

var list_active = {};
var list_removed = {};
var users = {};

users.add_user = function (user_info, conn) {
	var vc_id = user_info.vc_id;

	if (list_active[vc_id])
		return false;

	list_active[vc_id] = {};
	list_active[vc_id].user = user_info;
	list_active[vc_id].conn = conn;
	list_active[vc_id].state = 'waiting';

	log.info ('user \"' + vc_id + '\" added');
	return true;
};

users.remove_user = function (vc_id) {
	if (!list_active[vc_id])
		return false;

	list_removed[vc_id] = {};
	list_removed[vc_id].user = list_active[vc_id].user;

	delete list_active[vc_id];

	log.info ('user \"' + vc_id + '\" removed');

	return true;
};

users.mark_joined = function (vc_id) {
	list_active[vc_id].state = 'in-session';
};

users.all_waiting = function () {
	var arr = [];

	for (var u in list_active) {
		if (list_active[u].state === 'waiting')
			arr.push(list_active[u].user);
	}

	return arr;
};

users.send_info = function (vc_id, from, to, info_id, info) {
	var _u = list_active[vc_id];

	if (!_u) {
		log.error ('users:send_info: user \"' + vc_id + '\" not in the active list');
		return;
	}

	if (!joined(_u)) {
		log.warn ('users:send_info: \"' + info_id + '\" not sent to user.' + vc_id + ' : reason - not active');
		return;
	}

	var conn = _u.conn;
	conn.send_info (from, addr.prepend(to, 'user', vc_id), info_id, info);
};


users.broadcast_info = function (from, to, info_id, info, except) {
	var list = [];

	for (var u in list_active) {
		var _user = list_active[u].user;
		var _conn = list_active[u].conn;

		if (except)
			if (_user.vc_id == except)
				continue;

		if (!joined(list_active[u]))
			continue;

		var _to = addr.prepend (to, 'user', _user.vc_id);
		_conn.send_info (from, _to, info_id, info);
	}
};

users.get_publishable_info = function (vc_id, exclude) {

	if (vc_id) {

		if (!list_active[vc_id]) {
			return {
				vc_id : vc_id,
				displayName : '--error-inactive--',
			};
		}
		return [ publishable_info(list_active[vc_id].user) ];
	}

	var info = [];
	for (var id in list_active)
		if (id != exclude && joined( list_active[id]) )				/* -changed by pawan */
			info.push (publishable_info (list_active[id].user));

	return info;
};

function publishable_info (user_info) {
	/* Return the full thing for now - but some infromtaion shoudlbe held back 
	 * from a privacy point of view */
	return user_info;
}

function joined (user) {
	if (user.state === 'in-session')
		return true;
	
	return false;
}

module.exports = users;
