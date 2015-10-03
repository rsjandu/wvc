var path      = require('path');
var fs        = require('fs');
var jade      = require('jade');
var log       = require('../common/log');
var _E        = require('../common/custom-error');

templates = {};

templates.load = function (dir, callback) {
	/*
	 * 1. Get a list of templates
	 * 2. Compile them all and form a Javascript
	 * 3. Send it
	 */
	__get_list(dir, function(err, files) {
		if (err)
			return callback(_E(500, err), null);

		if (!files)
			return callback(_E(404, 'Some templates not found'), null);

		var templates = {};
		for (var i = 0; i < files.length; i++) {
			var file_name = files[i].replace(/\.jade$/, '');
			templates[file_name] = __function_body(dir, file_name);
		}

		log.debug ('templates = ', templates);

		return callback (null, templates);
	});

	return;
};

function __get_list (path, callback) {

	fs.readdir(path, function(err, _files) {

		var files = [];

		if (err)
			return callback (err, null);

		/* Else sift through and return only the .jade files */
		for (var i = 0; i < _files.length; i++) {
			if (_files[i].match(/\.jade$/))
				files.push(_files[i]);
		}

		return callback (null, files);

	});
}

/*
 * Jade compilation produces a function string of the following form:
 *
 * 	--> "function name(locals) { <body> }".
 *
 * We want to change it to the following form:
 *
 * --> "template.name = function(locals) { <body> }"
 *
 */
function __function_body (dir, file) {

	log.info ('loading template ' + file + '.jade');

	var _func = jade.compileFileClient(path.join(dir, file + '.jade'), { name: file });
	var func = _func.replace(/function[ ]+([^() ]+)[ ]*\(/g, 'templates.$1 = function (');

	log.debug ('_func ==>', _func);
	log.debug ('func ==>', func);

	return func;
}

module.exports = templates;
