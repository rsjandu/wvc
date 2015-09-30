var url             = require('url');
var log             = require("../common/log");
var events          = require('./events');

var counter = 1;
var list = {};

function set_user (user) {
	var conn_id = this.conn_id;

	if (!list[conn_id]) {
		log.error ('connection:set_user: unknown conn_id = ' + conn_id);
		return;
	}

	list[conn_id].user = user;
}

function close () {
	log.debug ('connection: closed: removing conn_id = ' + this.id);
	events.emit ('connection:closed', this.user);
	delete list[this.id];
}

function show_conn () {
	log.debug ('____ connection info ____');
	log.debug ('    id       : ' + this.id);
	log.debug ('    user     : ' + this.user);
	log.debug ('    state    : ' + this.state);
	log.debug ('    location : ' + this.id);
}

module.exports = function (sock) {

	var location = url.parse (sock.upgradeReq.url, true);
	var c = {
		id       : counter++,
		sock     : sock,
		location : location.path,
		state    : 'connected'
	};

	if (list[c.id])
		log.error ('connection:new: possibly over-writing connection info: id = ' + c.id);

	list[c.id] = c;
	return {
		conn_id  : c.id,
		set_user : set_user,
		close    : close,
		show     : show_conn
	};
};
