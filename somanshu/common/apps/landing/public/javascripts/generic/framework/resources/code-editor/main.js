define(function(require) {
	var $ 			= require('jquery');
	var framework 	= require('framework');
	var log 		= require('log')('code-editor', 'info');
	var editor 		= {};
	var code_editor = {};
	var c_handle	= framework.handle ('code-editor');

	code_editor.init = function(display_spec, custom, perms){
		var _d = $.Deferred();
		var anchor = display_spec.anchor;
		var template = c_handle.template ( display_spec.templates[0] );
		var ace_editor = template();
		$(anchor).append ( ace_editor);
		$('#mode').on('change', modeChanger);
		$('#theme').on('change', themeChanger);
		$('#sce-ace_editor').append('<h1> Loading... </h1>');
		_d.resolve();
		return _d.promise();
	};

	code_editor.start = function (sess_info) {
		log.info('start shared editor');
		require(['./ace/ace'], function () {

			require(['bcsocket'], function () {

				require(['share_uncompressed'], function () {

					require(['ace_share'], function () {
						var elem = document.getElementById("sce-ace_editor");
						editor = ace.edit(elem);
						require(['./ace/mode-javascript'], function () {
							require(['ace/mode/javascript'], function (mode) {
								editor.session.setMode(new (mode.Mode));
							});
						});
						require(['./ace/theme-monokai'], function () {
							editor.setTheme("ace/theme/monokai");
						});

						sharejs.open('pad1', 'text', 'http://localhost:8000/channel', function(error, doc) {
							if (error){
								log.info("Error in opening Doc ::"+error);
							}
							else {
								doc.attach_ace(editor);
								editor.setReadOnly(false);
							}
							});
					});
				});
			});
		});
	};

	themeChanger = function (change) {
		var themer = $("#theme").val();
		var typeTheme = "";
		switch (themer) {
			case "monokai":
				typeTheme = "monokai";
				break;
			case "solar_dark":
				typeTheme = "solarized_dark";
				break;
			case "chrome":
				typeTheme = "chrome";
				break;
			case "clouds":
				typeTheme = "clouds";
				break;
			case "clouds2":
				typeTheme = "clouds_midnight";
				break;
		}
		require (['./ace/theme-'+typeTheme], function () {
			editor.setTheme("ace/theme/"+ typeTheme);
		});
	};

	modeChanger = function (change) {
		var coder = $('#mode').val();
		var typeCompiler = "";
		switch (coder) {
			case "js":
				typeCompiler = "javascript";
				break;
			case "html":
				typeCompiler = "html";
				break;
			case "cpp":
				typeCompiler = "c_cpp";
				break;
		}
		require(['./ace/mode-'+typeCompiler], function () {
			require(['ace/mode/'+typeCompiler], function(mode){
				editor.session.setMode(new (mode.Mode));
			});
		});
	};
	return code_editor;
});
