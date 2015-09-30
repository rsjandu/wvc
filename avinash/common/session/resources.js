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
			list[r.name].handle = require('./resources/' + r.name);
			list[r.name].handle.init (r, common, sess_config.handles);
		}
		catch (e) {
			log.error ('resources: load ' + r.name + ', err = ', e);
		}
	}
};

res.notify = function (what, data) {
	for (var m in list) {
		if (list[m].handle.notify)
			list[m].handle.notify (what, data);
	}
};

module.exports = res;
