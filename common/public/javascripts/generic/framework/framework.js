define(function(require) {
	var $         = require('jquery');
	var av        = require('widget-av');
	var cc        = require('cc');
	var identity  = require('identity');
	var notify    = require('widget-notify');
	var tabs      = require('widget-tabs');
	var log       = require('log')('framework', 'info');

	var framework = {};
	var layout    = {};
	var modules   = {};

	framework.init = function (sess_config) {
		var _d = $.Deferred();

		log.log ('init called with ', sess_config);
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
			function (err) {
				log.error ('init failed for \"' + _module.name + '\" : err = ' + err);
				_d.reject(err);
				return;
			}
		);

		return _d.promise();
	};

	framework.start_module = function (session_info, _module) {
		var name = _module.name;

		if (!_module.handle.start) {
			log.error ('module \"' + name + '\": \"start\" method undefined');
			return;
		}

		if (!session_info.info[name])
			log.log ('module \"' + name + '\": session info not defined');

		log.info ('starting module \"' + name + '\" ...');

		try { _module.handle.start (session_info.info[name]); }
		catch (e) {
			log.error ('module \"' + name + '\": start err = ' + e);
		}
	};

	var _d_start;
	framework.wait_for_start = function () {
		_d_start = $.Deferred ();

		/*
		 * Nothing to be done here, except when we recieve the 
		 * message from the session controller. We trigger this
		 * promise then. */

		return _d_start.promise ();
	};

	function started (sess_info) {
		log.info ('class started : ', sess_info);
		_d_start.resolve (sess_info);
	}

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

	framework.rx_info = function (from, to, id, data) {

		switch (to) {
			case 'framework' :
				switch (id) {
					case 'session-info': started (data); break;
					default :
						log.error ('handler for info \"' + id + '\" NOT IMPLEMENTED (to: ' + to + ')');
				}
				break;

			default :
				deliver_info (from, to, id, data);
		}
	};

	framework.handle = function (module_name) {

		var handle = {
			module_name    : module_name,
			send_command   : send_command,
			send_info      : send_info,
			template       : template
		};

		return handle;
	};

	/*---------------------------------------------
	 * Internal functions
	 *--------------------------------------------*/


	/*
	 * returns a promise
	 */
	function send_command (user, sub_resource, op) {
		var _d      = $.Deferred ();

		var to = 'user:' + user + '.resource:' + this.module_name;
		cc.send_command (to, sub_resource, op, this.module_name)
			.then (
				_d.resolve.bind(_d),
				_d.reject.bind(_d)
			);


		return _d.promise();
	}

	function template (name) {
		if (!_templates[this.module_name] || !_templates[this.module_name][name])
			return null;

		/* jslint evil: true */
		var _t = new Function('locals', 'return ' + _templates[this.module_name][name]);

		return _t();
	}

	function send_info (user, info_id, data, from_instance) {

		var module_suffix = '.' + this.module_name + ':' + (from_instance? from_instance: '0');

		/*
		 * if user is null or empty, the intended recipient is
		 * the server counterpart of the module. */

		to = (!user || user.length === 0) ?
			this.module_name :
			'user:' + user + module_suffix;

		var from = 'user:' + identity.name + module_suffix;

		cc.send_info (from, to, info_id, data);

		return;
	}

	function deliver_info (from, to, id, data) {
		if (!modules[to]) {
			log.error ('deliver_info: unknown module \"' + to + '\"');
			return;
		}

		try {
			modules[to].handle.info (from, id, data);
		}
		catch (e) {
			log.error ('deliver_info: \"' + to + '\" err = ' + e);
		}
	}

	function __probe_layout () {

		if ($('#widget-nav').length !== 0)
			layout.nav = $('#widget-nav')[0];

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
			case 'tabs'   : return tabs.attach (layout.notify, _module);

			default : 
				log.error ('_module ' + _module.name + ' requesting non-existent widget ' + widget);
			return '_module ' + _module.name + ' requesting non-existent widget ' + widget;
		}
	}

	return framework;
});
