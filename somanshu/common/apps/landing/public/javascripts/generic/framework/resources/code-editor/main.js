define(function(require) {
	var $ 			= require('jquery');
	var framework 	= require('framework');
	var log 		= require('log')('code-editor', 'info');
	var editor 		= {};
	var code_editor = {};
	var c_handle	= framework.handle ('code-editor');
	var fileName	= "";
	var fileType	= "js";

	code_editor.init = function(display_spec, custom, perms){
		var _d = $.Deferred();
		var anchor = display_spec.anchor;
		var template = c_handle.template ( display_spec.templates[0] );
		var ace_editor = template();
		$(anchor).append ( ace_editor);
		$('#mode').on('change', modeChanger);
		$('#theme').on('change', themeChanger);
		$('#ace-fontSize').on('change', sizeChanger);
		$('.ace_undo').on('click', undoHandler);
		$('.ace_redo').on('click', redoHandler);
		$('#sce-ace_editor').append('<h1> Loading... </h1>');
		$('#loadFile').on('change', handleFileSelect);
		$('#saveFile').on('click', saveFileOnSystem);
		$.event.props.push( "dataTransfer" );
		$('#sce-ace_editor').on('dragover', handleDragOver);
		$('#sce-ace_editor').on('drop', handleDrop);
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
						editor.$blockScrolling = Infinity;
						require(['./ace/ext-language_tools'], function () {
							require(['ace/ext/language_tools'], function (tmp) {
								editor.setOptions({
									enableBasicAutocompletion: true,
									enableSnippets: true,
									enableLiveAutocompletion: false
								});
							});
						});
						require(['./ace/mode-javascript'], function () {
							require(['ace/mode/javascript'], function (mode) {
								editor.session.setMode(new (mode.Mode));
							});
						});
						require(['./ace/theme-monokai'], function () {
							editor.setTheme("ace/theme/monokai");
						});

						hiddenTextArea = document.getElementById('newFile');
						editor.commands.addCommand({
							name: "save",
							bindKey: {win: "Ctrl-S", mac: "Command-S"},
							exec: function () {
								saveFileOnSystem();
							}
						});
						editor.commands.addCommand({
							name: "open",
							bindKey: {win: "Ctrl-O", mac: "Command-O"},
							exec: function () {
								document.getElementById("loadFile").click();
							}
						});

						sharejs.open('pad1', 'text', 'http://localhost:8000/channel', function(error, doc) {
							if (error){
								log.info("Error in opening Doc ::"+error);
							}
							else {
								doc.attach_ace(editor);
								editor.setReadOnly(false);
								editor.setBehavioursEnabled(true);
							}
							//setInterval(function(){
						//		editor.insert('somanshu\n');
						//	},1);
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
				fileType = "js";
				break;
			case "html":
				typeCompiler = "html";
				fileType = "html";
				break;
			case "cpp":
				typeCompiler = "c_cpp";
				fileType = "cpp";
				break;
		}
		require(['./ace/mode-'+typeCompiler], function () {
			require(['ace/mode/'+typeCompiler], function(mode){
				editor.session.setMode(new (mode.Mode));
			});
		});
	};

	sizeChanger = function (change) {
		var sizer = $('#ace-fontSize').val();
		editor.setFontSize(Number(sizer));
	};

	undoHandler = function () {
		var um = editor.getSession().getUndoManager();
		log.info("1::"+um);
		um.undo();
		log.info("2::"+um);
		$('.ace_undo').attr('disabled', um.hasUndo() ? false : true );
	};

	redoHandler = function () {
		um = editor.getSession().getUndoManager();
		log.info("3::"+um);
		um.redo();
		$('.ace_redo').attr('disabled', um.hasRedo() ? false : true );
	};

	saveFileOnSystem = function () {
		var code  = editor.getSession().getValue();
		require(['./FileSaver'], function () {
				var blob = new Blob([code], {type:"text/plain;charset=utf-8"});
				saveAs(blob, "code."+ fileType);
		});
	};

	handleFileSelect = function (evt) {
		var file = evt.target.files[0];
		var reader = new FileReader();
		reader.onload = function (f) {
			var code = f.target.result;
			editor.getSession().setValue(code);
		};
		reader.readAsText(file);
	};

	handleDragOver = function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = "copy";
	};	

	handleDrop = function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		var files = evt.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function (f) {
			var code = f.target.result;
			editor.getSession().setValue(code);
		};
		reader.readAsText(files);
	};
	return code_editor;
});
