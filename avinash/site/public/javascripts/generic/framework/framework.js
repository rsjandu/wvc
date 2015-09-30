define(function(require) {
	var $ = require('jquery');
	var av = require('widget-av');
	var cc = require('cc');
	var identity = require('identity');
	var notify = require('widget-notify');
	var log = require('log')('framework', 'info');
	var framework = {};
	var layout = {};
	var modules = {};

	framework.init = function (sess_config) {
		var _d = $.Deferred();

		log.log ('init called');
		__probe_layout();

		_d.resolve(sess_config);

		return _d.promise();
	};

	framework.init_modules = function (_module) {
		var err = '';
		var _d = $.Deferred();

		if (modules[_module.name]) {
			log.error ('Duplicate module for init: ' + _module.name);
			_d.reject('Duplicate module' + _module.name);
			return _d.promise ();
		}

		modules[_module.name] = _module;

		log.info ('inserting module - ' + _module.name + ' ...');

		if ((err = __attach_module (layout, _module)) !== null) {

			log.error ('Failed to attach module ' + _module.name);

			_d.reject (err);
			return _d.promise ();
		}

		var _d_mod = _module.handle.init (
			_module.resource.display_spec,
			_module.resource.custom,
			_module.resource.perms
		);

		_d_mod.then (
			function() {
				modules[_module.name] = _module;
				_d.resolve (_module);
			},
			_d.reject.bind(_d)
		);

		return _d.promise();
	};

	/*
	 * Command structure for the resource:
	 * 	{
	 * 		to: <address>,
	 * 		type: req|info,
	 *		msg: <message>
	 *	}
	 *
	 *	"caller" just like "to" is of the form:
	 *		recource-name[:instance #]
	 */

	framework.send_command = function (caller, command) {
		var _d = $.Deferred ();

		if (!modules[caller]) {
			_d.reject ('Unlisted module : ' + caller);
			return _d.promise ();
		}

		var user_id  = command.to.split(':')[0];
		var instance = command.to.split(':')[1];

		/*
		 * TODO: There should be a perms check here, to see
		 * if this user:resource is allowed this action. */

		command.type = 'req';
		command.to   = user_id + ':' + caller + (instance ? ':' + instance : '');
		command.from = identity.name + ':' + caller;

		cc.send_command (command)
			.then (
				_d.resolve.bind(_d),
				_d.reject.bind(_d)
			);

		return _d.promise ();
	};

	framework.send_info = function (caller, info) {
		if (!modules[called]) {
			log.error ('Unlisted module : ' + caller);
			return false;
		}

		/*
		 * TODO: There should be a perms check here, to see
		 * if this user:resource is allowed to send a broadcast
		 * message. */

		info.type = 'info';
		info.to = 'user:' + command.to + ':' + caller;
		info.from = identity.name + ':' + caller;

		return cc.send_info (info);
	};

	/*
	 * Called by the CC module to deliver an incoming req.
	 * Should return a promise. */

	framework.rx_req = function (message) {
		var module_name = message.to.split(':')[1];
		var instance    = message.to.split(':')[2];
		var _d = $.Deferred ();

		if (module_name === 'framework') {
			handle_req (_d, message);
			return _d.promise ();
		}

		if (!modules[module_name]) {
			_d.reject ('module (' + module_name + ') not registered');
			return _d.promise ();
		}

		/* TODO : do check for instance */

		modules[module_name].handle.remote_req (message.msg)
			.then (
				_d.resolve.bind(_d),
				_d.reject.bind(_d)
			);

		return _d.promise ();
	};

	framework.rx_info = function (message) {
	};

	framework.handle = function (module_name) {

		var handle = {
			module_name    : module_name,
			send_comamnd   : send_command,
		};

		return handle;
	};

	/*---------------------------------------------
	 * Internal functions
	 *--------------------------------------------*/


	/*
	 * returns a promise
	 */
	function send_command (user, target, op) {
		var _d      = $.Deferred ();
		var from    = indentity.name;
		var command = protocol.command_pdu (user, this.module_name, from, target, op);

		cc.send_command (command)
			.then (
				_d.resolve.bind(_d),
				_d.reject.bind(_d)
			);


		return _d.promise();
	}

	function __probe_layout () {

		if ($('#widget-top').length !== 0)
			layout.top = $('#widget-top')[0];

		if ($('#widget-notify').length !== 0)
			layout.notify = $('#widget-notify')[0];

		if ($('#widget-av').length !== 0)
			layout.av = $('#widget-av')[0];

		if ($('#widget-chat').length !== 0)
			layout.chat = $('#widget-chat')[0];

		if ($('#widget-tabs').length !== 0)
			layout.tabs = $('#widget-tabs')[0];

		if ($('#widget-side-left').length !== 0)
			layout.side_left = $('#widget-side-left')[0];

		if ($('#widget-side-right').length !== 0)
			layout.side_right = $('#widget-side-right')[0];
	}

	function __attach_module (layout, _module) {
		var widget = _module.resource.display_spec.widget;
		var inner;

		switch (widget) {

			case 'av'     : return av.attach (layout.av, _module);
			case 'notify' : return notify.attach (layout.notify, _module);

			default : 
				log.error ('_module ' + _module.name + ' requesting non-existent widget ' + widget);
			return '_module ' + _module.name + ' requesting non-existent widget ' + widget;
		}
	}

	return framework;
});
