var $               = require("jquery-deferred");
var log             = require("../common/log");
var config          = require("../config");
var sess_info       = require("./session-info");
var $               = require('jquery-deferred');

var list = {};
var res = {};

res.load = function (sess_info) {

	var _d        = $.Deferred ();
	var resources = sess_info.resources;
	var common    = sess_info.common;
	var counter   = resources.length;

	function mod_ok () {
		counter--;
		log.info ('resources:module.init: \"' + this + '\" ok');
		if (!counter)
			finish();
	}

	function mod_err (err) {
		counter--;
		log.error ('resources:module.init: \"' + this + '\" err = ' + err);
		if (!counter)
			finish();
	}

	function finish () {
		_d.resolve ();
	}

	if (!resources) {
		log.error ('resources: resources not defined in sess_info');
		return;
	}

	/* Add additional utility handles */
	sess_info.handles = {};
	sess_info.handles.log = log;

	for (var i = 0; i < resources.length; i++) {
		var r = resources[i];

		list[r.name] = {};
		try {
			list[r.name].handle = require('./resources/' + r.name + '/main.js');
			list[r.name].handle.init (r, common, sess_info.handles)
				.then (mod_ok.bind(r.name), mod_err.bind(r.name));
		}
		catch (e) {
			mod_err.call(r.name, e);
		}
	}

	return _d.promise ();
};

res.init_user = function (user) {
	var _d = $.Deferred ();
	var d_arr = [];
	var info = {};
	var info_err  = {};
	var counter = 0;

	function mod_ok (m, data) {
		info[m] = data;
		counter--;
		if (!counter)
			finish ();
	}

	function mod_err (m, err) {
		info_err[m] = err;
		counter--;
		if (!counter)
			finish ();
	}

	function finish () {
		_d.resolve ({
			info : info,
			info_err : info_err
		});
	}

	for (var m in list) {
		if (list[m].handle.init_user) {
			counter++;

			var d_mod = list[m].handle.init_user (user);

			d_mod.then (
				mod_ok.bind(d_mod, m),
				mod_err.bind(d_mod, m)
			);
		}
	}

	return _d.promise ();
};

module.exports = res;
