var log             = require("../common/log");
var config          = require("../config");
var sess_config     = require("./sess-config");

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

res.notify = function (what, data) {
	var _d = $.Deferred ();
	var d_arr = [];
	var info = {};

	for (var m in list) {
		if (list[m].handle.notify)
			d_arr.push ( list[m].handle.notify (what, data) );
	}

	$.when.apply($, d_arr)
		.then (
			function () {
				var i = 0;
				for (var m in list) {
					var module_info = arguments[i++];
					info[m] = module_info;
				}

				_d.resolve (info);
			},
			function (err) {
				log.error ('resources:notify: err = ' + err);
				_d.resolve (info);
			}
		);
	
	return _d.promise ();
};

module.exports = res;
