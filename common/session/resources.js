var $               = require("jquery-deferred");
var log             = require("../common/log");
var config          = require("../config");
var sess_config     = require("./sess-config");
var $               = require('jquery-deferred');

var list = {};
var res = {};

res.load = function (sess_config) {

	var resources = sess_config.resources;
	var common    = sess_config.common;

	if (!resources) {
		log.error ('resources: resources not defined in sess_config');
		return;
	}

	/* Add additional utility handles */
	sess_config.handles = {};
	sess_config.handles.log = log;

	for (var i = 0; i < resources.length; i++) {
		var r = resources[i];

		list[r.name] = {};
		try {
			list[r.name].handle = require('./resources/' + r.name + '/main.js');
			list[r.name].handle.init (r, common, sess_config.handles);
		}
		catch (e) {
			log.error ('resources: load ' + r.name + ', err = ', e);
		}
	}
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
