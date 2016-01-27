var $           = require("jquery-deferred");
var code_editor = {};
var log;
var coms;
var sess_info;

code_editor.init = function (myinfo, common, handles) {
	var _d = $.Deferred ();
	log = handles.log;
	coms = handles.coms;
	log.info ('code-editor : init :', JSON.stringify(myinfo));
	sess_info = myinfo.custom;
	_d.resolve();
	return _d.promise();
};

code_editor.init_user = function (user) {
	var _d = $.Deferred();
	_d.resolve(sess_info);
	return _d.promise();
};

code_editor.info = function (from, id, info) {
	coms.broadcast_info (id, info, from);
	log.info("editor-info::"+JSON.stringify(info));
	sess_info.current_lang = info.mode;
};

module.exports = code_editor;
