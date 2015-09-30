var log = require("../common/log");
var config = require("../config");

var prot = {};

prot.parse = function (e) {

	var message = JSON.parse(e); 

	if (message.v !== 1)
		throw new Error ('illegal protocol');

	return message;
};

prot.command_pdu = function (to_user, module, from_user, target, op) {
	var m = {};

	if (!to_user || !from_user || !target || !op) {
		log.error ('command_pdu: null argument(s): to_user - ' + to_user + ', from_user - ' + from_user + ', target - ' + target + ', op -' + op);
		return null;
	}

	m.v     = '1';
	m.type  = 'req';

	/*
	 * "to" is of the form:
	 * 		{
	 * 			ep:	{
	 * 					t : type ==> 'user' | 'server'
	 * 					i : identifier (NA in case of 'server' and is an array:
	 * 							- [ name1, name2 .. ]
	 * 							- [ * ]
	 * 				}
	 * 			res : resource-name
	 * 		}
	 */

	m.to     = {};
	m.to.ep  = { t : 'user', i : [] };
	m.to.res = module;

	if (to_user instanceof Array)
		for (i = 0; i < to_user.length; i++)
	m.to.ep.i.push(to_user[i]);
	else
		m.to.ep.i.push(to_user);

	m.from = {
		ep : {
			t : 'user',
			i : from_user
		},
		res : module
	};

	m.msg  = {
		target : target,
		op     : op
	};

	return m;
};

prot.info_pdu = function (to_user, to_module, from_module, info_id, info) {
	var m = {};

	if (!to_user || !from_user || !info_id || !info) {
		log.error ('command_pdu: null argument(s): to_user - ' + to_user + ', from_user - ' + from_user + ', info_id - ' + info_id + ', info -' + info);
		return null;
	}

	m.v     = '1';
	m.type  = 'info';

	/*
	 * "to" is of the form:
	 * 		{
	 * 			ep:	{
	 * 					t : type ==> 'user' | 'server'
	 * 					i : identifier (NA in case of 'server' and is an array:
	 * 							- [ name1, name2 .. ]
	 * 							- [ * ]
	 * 				}
	 * 			res : resource-name
	 * 		}
	 */

	m.to     = {};
	m.to.ep  = { t : 'user', i : [] };
	m.to.res = to_module;

	if (to_user instanceof Array)
		for (i = 0; i < to_user.length; i++)
	m.to.ep.i.push(to_user[i]);
	else
		m.to.ep.i.push(to_user);

	m.from = {
		ep : {
			t : 'controller'
		},
		res : from_module
	};

	m.msg  = {
		info_id : info_id,
		info    : info
	};

	return m;
};

prot.auth_pdu = function (from_user) {
	var m = {};

	m.v = 1;
	m.type = 'req';
	m.to = {};
	m.to.ep = { t : 'server' };
	m.to.res = 'auth';

	m.from = {
		ep : {
			t : 'user',
			i : from_user
		},
		res : 'framework'
	};

	m.msg = {};

	return m;
};

prot.ack_pdu = function (message, status, data) {
	var m = {};

	m.v = 1;
	m.type = 'ack';
	m.to   = message.from;
	m.from = message.to;
	m.msg  = {
		status : status,
		data   : data
	};

	return m;
};

module.exports = prot;
