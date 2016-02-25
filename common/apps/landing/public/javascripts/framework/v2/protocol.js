define(function(require) {
	var log = require('log')('protocol', 'info');
	var identity = require('identity');

	var prot = {};

	prot.parse = function (e) {

		var message = JSON.parse(e); 

		if (message.v !== 1)
			throw new Error ('illegal protocol v');

		if (!message.to || !message.from)
			throw new Error ('illegal protocol (from/to) address');

		if ((message.type != 'auth') &&
			(message.type != 'req') &&
			(message.type != 'info') &&
			(message.type != 'ack'))
			throw new Error ('illegal protocol message type');

		return message;
	};

	prot.command_pdu = function (from, to, command, data) {
		var m = {};

		if (!from || !to || !command) {
			log.error ('command_pdu: null argument(s): ' +
					   		'from = ' + from +
					   		'to = ' + to +
					   		', command = ' + command
					  );

			return null;
		}

		m.v     = 1;
		m.type  = 'req';

		m.to    = to;
		m.from  = from;

		m.msg  = {
			command : command,
			data    : data
		};

		return m;
	};

	prot.info_pdu = function (from, to, info_id, data) {
		var m = {};

		if (!from || !to || !info_id || !data) {
			log.error ('command_pdu: null argument(s): ' +
					   		'from = ' + from +
					   		', to = ' + to +
					   		', info_id = ' + info_id +
					   		', data = ' + data
					  );

			return null;
		}

		m.v     = 1;
		m.type  = 'info';

		m.to    = to;
		m.from  = from;

		m.msg  = {
			info_id : info_id,
			info    : data
		};

		return m;
	};

	prot.auth_pdu = function (to, from, data) {
		var m = {};

		m.v = 1;
		m.type = 'req';
		m.to = to;
		m.from = from;
		m.msg  = {
			command : 'authenticate-me',
			data    : data
		};


		return m;
	};

	prot.ack_pdu = function (message, status, data) {
		var m = {};

		m.v = 1;
		m.type = 'ack';
		m.to   = message.from;
		m.from = 'user:' + identity.vc_id + '.' + message.to;
		m.msg  = {
			status : status,
			data   : data
		};

		return m;
	};

	return prot;
});
